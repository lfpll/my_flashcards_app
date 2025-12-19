import { supabase } from '../lib/supabase';

const MIGRATION_FLAG = 'flashcards_migrated';

// Simple helper: convert to ISO string, or use current date if invalid
function safeToISOString(value: any): string {
  try {
    const date = new Date(value);
    const year = date.getFullYear();
    // Only accept dates between year 1970 and 2100
    if (!isNaN(date.getTime()) && year >= 1970 && year <= 2100) {
      return date.toISOString();
    }
  } catch {}
  return new Date().toISOString();
}

export async function migrateLocalStorageToSupabase(userId: string): Promise<void> {
  const migrationKey = `${MIGRATION_FLAG}_${userId}`;
  
  try {
    // If Supabase is not configured, skip migration
    if (!supabase) {
      console.warn('Supabase not configured, skipping migration');
      return;
    }
    
    // Check if already migrated FOR THIS USER
    if (localStorage.getItem(migrationKey)) {
      console.log('Data already migrated for this user');
      return;
    }
    
    // Load localStorage data
    const dataStr = localStorage.getItem('flashcards_data');
    if (!dataStr) {
      console.log('No local data to migrate');
      // Only set flag if we successfully checked and there's nothing to migrate
      localStorage.setItem(migrationKey, 'true');
      return;
    }
    
    const data = JSON.parse(dataStr);
    const decks = data.decks || [];
    
    if (decks.length === 0) {
      console.log('No decks to migrate');
      localStorage.setItem(migrationKey, 'true');
      return;
    }
    
    console.log(`🔄 Starting ATOMIC migration of ${decks.length} decks to Supabase...`);
    
    // Track all errors - if ANY error occurs, migration fails
    const errors: any[] = [];
    const migratedDeckIds: string[] = [];
    
    // Migrate each deck
    for (const deck of decks) {
      try {
        // Insert deck with safe date handling
        const { data: newDeck, error: deckError } = await supabase
          .from('decks')
          .insert({
            user_id: userId,
            name: deck.name,
            description: deck.description,
            created_at: safeToISOString(deck.createdAt),
            updated_at: safeToISOString(deck.updatedAt)
          })
          .select()
          .single();
        
        if (deckError) {
          errors.push({ type: 'deck', name: deck.name, error: deckError });
          console.error(`❌ Failed to migrate deck "${deck.name}":`, deckError);
          throw deckError; // Stop immediately on deck error
        }
        
        console.log(`✅ Migrated deck: "${deck.name}"`);
        migratedDeckIds.push(newDeck.id);
        
        // Insert cards for this deck with safe date handling
        if (deck.cards && deck.cards.length > 0) {
          const cardsToInsert = deck.cards.map((card: any) => ({
            deck_id: newDeck.id,
            user_id: userId,
            front: card.front,
            back: card.back,
            front_image: card.frontImageUrl || null,
            back_image: card.backImageUrl || null,
            ease_factor: card.easeFactor || 2.5,
            interval: card.interval || 0,
            repetitions: card.repetitions || 0,
            next_review: safeToISOString(card.nextReview),
            created_at: safeToISOString(card.createdAt)
          }));
          
          const { error: cardsError } = await supabase
            .from('cards')
            .insert(cardsToInsert);
          
          if (cardsError) {
            errors.push({ type: 'cards', deck: deck.name, error: cardsError });
            console.error(`❌ Failed to migrate ${cardsToInsert.length} cards for deck "${deck.name}":`, cardsError);
            throw cardsError; // Stop immediately on cards error
          }
          
          console.log(`  ✅ Migrated ${cardsToInsert.length} cards`);
        }
      } catch (error) {
        // Rollback: Delete any decks we created
        console.warn('🔄 Rolling back migration...');
        for (const deckId of migratedDeckIds) {
          await supabase.from('decks').delete().eq('id', deckId);
        }
        console.error('❌ Migration rolled back due to errors');
        throw error; // Re-throw to be caught by outer catch
      }
    }
    
    // Migrate streak data (optional, doesn't fail migration)
    try {
      const streakStr = localStorage.getItem('flashcards_streak');
      if (streakStr) {
        const streakData = JSON.parse(streakStr);
        await supabase
          .from('user_stats')
          .upsert({
            user_id: userId,
            streak_data: streakData
          });
        console.log('✅ Migrated streak data');
      }
    } catch (streakError) {
      console.warn('⚠️ Failed to migrate streak data (non-critical):', streakError);
    }
    
    // Only mark as migrated if NO errors occurred
    if (errors.length === 0) {
      localStorage.setItem(migrationKey, 'true');
      console.log('✅ Migration completed successfully - all data migrated!');
    } else {
      console.error('❌ Migration failed with errors:', errors);
      throw new Error(`Migration failed: ${errors.length} error(s) occurred`);
    }
    
  } catch (error) {
    console.error('❌ MIGRATION FAILED - data NOT marked as migrated. You can try again:', error);
    // Don't set migration flag if migration failed
    // Remove partial flag if it exists
    localStorage.removeItem(migrationKey);
    throw error;
  }
}

// Helper function to clear migration flag (useful for debugging)
export function clearMigrationFlag(userId?: string): void {
  if (userId) {
    localStorage.removeItem(`${MIGRATION_FLAG}_${userId}`);
  }
  // Also clear old global flag
  localStorage.removeItem(MIGRATION_FLAG);
  console.log('Migration flag cleared');
}

