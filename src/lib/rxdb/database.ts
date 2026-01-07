/**
 * RxDB Database Setup with Supabase Replication
 */
import { createRxDatabase, RxDatabase, RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { replicateRxCollection, RxReplicationState } from 'rxdb/plugins/replication';
import { CardDoc, DeckDoc, cardSchema, deckSchema } from './schema';
import { supabase } from '../supabase';

// Wrap storage with validator for better error messages
const storage = wrappedValidateAjvStorage({ storage: getRxStorageDexie() });

// Collection types
export type CardCollection = RxCollection<CardDoc>;
export type DeckCollection = RxCollection<DeckDoc>;

export type FlashcardDatabase = RxDatabase<{
  cards: CardCollection;
  decks: DeckCollection;
}>;

// Checkpoint type for replication
interface ReplicationCheckpoint {
  updatedAt: string;
}

// Singleton database instance
let dbPromise: Promise<FlashcardDatabase> | null = null;
let replicationStates: RxReplicationState<any, any>[] = [];

/**
 * Initialize or get the RxDB database
 */
export async function getDatabase(): Promise<FlashcardDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = createDatabase();
  return dbPromise;
}

async function createDatabase(): Promise<FlashcardDatabase> {
  const db = await createRxDatabase<FlashcardDatabase>({
    name: 'flashcardsdb',
    storage
  });

  // Add collections
  await db.addCollections({
    cards: { schema: cardSchema },
    decks: { schema: deckSchema }
  });

  // Migrate from localStorage if needed
  await migrateFromLocalStorage(db);

  return db;
}

/**
 * Migrate existing localStorage data to RxDB (one-time)
 */
async function migrateFromLocalStorage(db: FlashcardDatabase): Promise<void> {
  const migrationKey = 'rxdb_migrated';
  if (localStorage.getItem(migrationKey)) return;

  const dataStr = localStorage.getItem('flashcards_data');
  if (!dataStr) {
    localStorage.setItem(migrationKey, 'true');
    return;
  }

  try {
    const data = JSON.parse(dataStr);
    const decks = data.decks || [];

    for (const deck of decks) {
      // Insert deck
      await db.decks.upsert({
        id: deck.id,
        name: deck.name,
        description: deck.description || '',
        createdAt: deck.createdAt || Date.now(),
        updatedAt: deck.updatedAt || Date.now(),
        userId: null
      });

      // Insert cards
      for (const card of deck.cards || []) {
        await db.cards.upsert({
          id: card.id,
          deckId: deck.id,
          front: card.front,
          back: card.back,
          frontImageUrl: card.frontImageUrl || null,
          backImageUrl: card.backImageUrl || null,
          easeFactor: card.easeFactor ?? 2.5,
          interval: card.interval ?? 1,
          repetitions: card.repetitions ?? 0,
          nextReview: card.nextReview ?? Date.now(),
          lastReviewed: card.lastReviewed ?? null,
          reviews: card.reviews || [],
          createdAt: card.createdAt || Date.now(),
          updatedAt: Date.now(),
          userId: null
        });
      }
    }

    localStorage.setItem(migrationKey, 'true');
    console.log('Successfully migrated localStorage data to RxDB');
  } catch (error) {
    console.error('Failed to migrate localStorage:', error);
  }
}

/**
 * Start Supabase replication for a user
 */
export async function startReplication(userId: string): Promise<void> {
  if (!supabase) return;
  
  const db = await getDatabase();

  // Stop any existing replication
  await stopReplication();

  // Claim orphan records (assign userId to records without one)
  await claimOrphanRecords(db, userId);

  // Start deck replication
  const deckReplication = replicateRxCollection({
    collection: db.decks,
    replicationIdentifier: `decks-${userId}`,
    push: {
      async handler(docs) {
        const rows = docs.map(doc => ({
          id: doc.newDocumentState.id,
          user_id: userId,
          name: doc.newDocumentState.name,
          description: doc.newDocumentState.description,
          created_at: new Date(doc.newDocumentState.createdAt).toISOString(),
          updated_at: new Date(doc.newDocumentState.updatedAt).toISOString()
        }));
        
        await supabase!.from('decks').upsert(rows, { onConflict: 'id' });
        return [];
      }
    },
    pull: {
      async handler(checkpoint: ReplicationCheckpoint | undefined) {
        const lastUpdated = checkpoint?.updatedAt || '1970-01-01T00:00:00Z';
        
        const { data, error } = await supabase!
          .from('decks')
          .select('*')
          .eq('user_id', userId)
          .gt('updated_at', lastUpdated)
          .order('updated_at', { ascending: true })
          .limit(100);

        if (error || !data?.length) {
          return { documents: [], checkpoint };
        }

        const documents = data.map(row => ({
          id: row.id,
          name: row.name,
          description: row.description || '',
          createdAt: new Date(row.created_at).getTime(),
          updatedAt: new Date(row.updated_at).getTime(),
          userId,
          _deleted: false
        }));

        return {
          documents,
          checkpoint: { updatedAt: data[data.length - 1].updated_at }
        };
      }
    }
  });

  // Start card replication
  const cardReplication = replicateRxCollection({
    collection: db.cards,
    replicationIdentifier: `cards-${userId}`,
    push: {
      async handler(docs) {
        const rows = docs.map(doc => ({
          id: doc.newDocumentState.id,
          deck_id: doc.newDocumentState.deckId,
          user_id: userId,
          front: doc.newDocumentState.front,
          back: doc.newDocumentState.back,
          front_image: doc.newDocumentState.frontImageUrl,
          back_image: doc.newDocumentState.backImageUrl,
          ease_factor: doc.newDocumentState.easeFactor,
          interval: doc.newDocumentState.interval,
          repetitions: doc.newDocumentState.repetitions,
          next_review: new Date(doc.newDocumentState.nextReview).toISOString(),
          created_at: new Date(doc.newDocumentState.createdAt).toISOString(),
          updated_at: new Date(doc.newDocumentState.updatedAt).toISOString()
        }));
        
        await supabase!.from('cards').upsert(rows, { onConflict: 'id' });
        return [];
      }
    },
    pull: {
      async handler(checkpoint: ReplicationCheckpoint | undefined) {
        const lastUpdated = checkpoint?.updatedAt || '1970-01-01T00:00:00Z';
        
        const { data, error } = await supabase!
          .from('cards')
          .select('*')
          .eq('user_id', userId)
          .gt('updated_at', lastUpdated)
          .order('updated_at', { ascending: true })
          .limit(100);

        if (error || !data?.length) {
          return { documents: [], checkpoint };
        }

        const documents = data.map(row => ({
          id: row.id,
          deckId: row.deck_id,
          front: row.front,
          back: row.back,
          frontImageUrl: row.front_image,
          backImageUrl: row.back_image,
          easeFactor: row.ease_factor,
          interval: row.interval,
          repetitions: row.repetitions,
          nextReview: new Date(row.next_review).getTime(),
          lastReviewed: null,
          reviews: [],
          createdAt: new Date(row.created_at).getTime(),
          updatedAt: new Date(row.updated_at).getTime(),
          userId,
          _deleted: false
        }));

        return {
          documents,
          checkpoint: { updatedAt: data[data.length - 1].updated_at }
        };
      }
    }
  });

  replicationStates = [deckReplication, cardReplication];
}

/**
 * Stop all active replications
 */
export async function stopReplication(): Promise<void> {
  for (const rep of replicationStates) {
    await rep.cancel();
  }
  replicationStates = [];
}

/**
 * Claim orphan records (assign userId to records without one)
 */
async function claimOrphanRecords(db: FlashcardDatabase, userId: string): Promise<void> {
  // Claim orphan decks
  const orphanDecks = await db.decks.find({
    selector: { userId: { $eq: null } }
  }).exec();

  for (const deck of orphanDecks) {
    await deck.patch({ userId, updatedAt: Date.now() });
  }

  // Claim orphan cards
  const orphanCards = await db.cards.find({
    selector: { userId: { $eq: null } }
  }).exec();

  for (const card of orphanCards) {
    await card.patch({ userId, updatedAt: Date.now() });
  }
}

