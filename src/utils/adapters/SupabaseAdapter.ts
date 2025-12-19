import { StorageAdapter } from '../storageAdapter';
import { supabase } from '../../lib/supabase';
import { Deck, Card } from '../../types/models';

// Helper function to safely convert timestamps to ISO strings
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

export class SupabaseAdapter implements StorageAdapter {
  constructor(private userId: string) {}

  // Transform Supabase snake_case to camelCase for Deck
  private transformDeck(data: any): Deck {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
      cards: data.cards ? data.cards.map((card: any) => this.transformCard(card)) : []
    };
  }

  // Transform Supabase snake_case to camelCase for Card
  private transformCard(data: any): Card {
    return {
      id: data.id,
      front: data.front,
      back: data.back,
      frontImageUrl: data.front_image,
      backImageUrl: data.back_image,
      easeFactor: data.ease_factor,
      interval: data.interval,
      repetitions: data.repetitions,
      nextReview: data.next_review ? new Date(data.next_review).getTime() : Date.now(),
      lastReviewed: null,
      reviews: [],
      createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now()
    };
  }

  // Transform camelCase to snake_case for Supabase insert/update
  private toDatabaseDeck(deck: Partial<Deck>): any {
    const result: any = {};
    if (deck.name !== undefined) result.name = deck.name;
    if (deck.description !== undefined) result.description = deck.description;
    if (deck.createdAt !== undefined) result.created_at = new Date(deck.createdAt).toISOString();
    if (deck.updatedAt !== undefined) result.updated_at = new Date(deck.updatedAt).toISOString();
    return result;
  }

  private toDatabaseCard(card: Partial<Card>): any {
    const result: any = {};
    if (card.front !== undefined) result.front = card.front;
    if (card.back !== undefined) result.back = card.back;
    if (card.frontImageUrl !== undefined) result.front_image = card.frontImageUrl;
    if (card.backImageUrl !== undefined) result.back_image = card.backImageUrl;
    if (card.easeFactor !== undefined) result.ease_factor = card.easeFactor;
    if (card.interval !== undefined) result.interval = card.interval;
    if (card.repetitions !== undefined) result.repetitions = card.repetitions;
    // Convert milliseconds timestamp to ISO string for Postgres using safe conversion
    if (card.nextReview !== undefined) result.next_review = safeToISOString(card.nextReview);
    // Note: last_reviewed and reviews columns don't exist in schema
    if (card.createdAt !== undefined) result.created_at = new Date(card.createdAt).toISOString();
    return result;
  }

  async getAllDecks(): Promise<Deck[]> {
    const { data, error } = await supabase
      .from('decks')
      .select(`
        id,
        name,
        description,
        created_at,
        updated_at,
        cards (
          id,
          front,
          back,
          front_image,
          back_image,
          ease_factor,
          interval,
          repetitions,
          next_review,
          created_at
        )
      `)
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return [];
    }

    return (data || []).map(deck => this.transformDeck(deck));
  }

  async getDeckById(deckId: string): Promise<Deck | undefined> {
    const { data, error } = await supabase
      .from('decks')
      .select(`
        id,
        name,
        description,
        created_at,
        updated_at,
        cards (
          id,
          front,
          back,
          front_image,
          back_image,
          ease_factor,
          interval,
          repetitions,
          next_review,
          created_at
        )
      `)
      .eq('id', deckId)
      .eq('user_id', this.userId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return undefined;
    }

    return data ? this.transformDeck(data) : undefined;
  }

  async createDeck(name: string, description: string): Promise<Deck> {
    const { data, error } = await supabase
      .from('decks')
      .insert({
        user_id: this.userId,
        name,
        description
      })
      .select()
      .single();

    if (error) throw error;

    return this.transformDeck({ ...data, cards: [] });
  }

  async updateDeck(deckId: string, updates: Partial<Deck>): Promise<Deck | null> {
    const dbUpdates = this.toDatabaseDeck(updates);
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('decks')
      .update(dbUpdates)
      .eq('id', deckId)
      .eq('user_id', this.userId)
      .select(`
        id,
        name,
        description,
        created_at,
        updated_at,
        cards (
          id,
          front,
          back,
          front_image,
          back_image,
          ease_factor,
          interval,
          repetitions,
          next_review,
          created_at
        )
      `)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    return data ? this.transformDeck(data) : null;
  }

  async deleteDeck(deckId: string): Promise<boolean> {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId)
      .eq('user_id', this.userId);

    if (error) {
      console.error('Supabase error:', error);
      return false;
    }

    return true;
  }

  async createCard(deckId: string, cardData: Partial<Card>): Promise<Card> {
    const dbCard = this.toDatabaseCard({
      front: cardData.front || '',
      back: cardData.back || '',
      frontImageUrl: cardData.frontImageUrl || null,
      backImageUrl: cardData.backImageUrl || null,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReview: Date.now(),
      lastReviewed: null,
      reviews: [],
      createdAt: Date.now()
    });

    dbCard.deck_id = deckId;
    dbCard.user_id = this.userId;

    const { data, error } = await supabase
      .from('cards')
      .insert(dbCard)
      .select()
      .single();

    if (error) throw error;

    // Update deck's updated_at timestamp
    await supabase
      .from('decks')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', deckId)
      .eq('user_id', this.userId);

    return this.transformCard(data);
  }

  async updateCard(deckId: string, cardId: string, updates: Partial<Card>): Promise<Card | null> {
    const dbUpdates = this.toDatabaseCard(updates);

    const { data, error } = await supabase
      .from('cards')
      .update(dbUpdates)
      .eq('id', cardId)
      .eq('deck_id', deckId)
      .eq('user_id', this.userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    // Update deck's updated_at timestamp
    await supabase
      .from('decks')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', deckId)
      .eq('user_id', this.userId);

    return data ? this.transformCard(data) : null;
  }

  async deleteCard(deckId: string, cardId: string): Promise<boolean> {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)
      .eq('deck_id', deckId)
      .eq('user_id', this.userId);

    if (error) {
      console.error('Supabase error:', error);
      return false;
    }

    // Update deck's updated_at timestamp
    await supabase
      .from('decks')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', deckId)
      .eq('user_id', this.userId);

    return true;
  }

  async getStreakData(): Promise<any> {
    const { data, error } = await supabase
      .from('user_stats')
      .select('streak_data')
      .eq('user_id', this.userId)
      .single();

    if (error || !data) {
      return {
        currentStreak: 0,
        lastStudyDate: null,
        longestStreak: 0,
      };
    }

    return data.streak_data || {
      currentStreak: 0,
      lastStudyDate: null,
      longestStreak: 0,
    };
  }

  async updateStreak(): Promise<any> {
    const streak = await this.getStreakData();
    const today = new Date().toDateString();
    const lastDate = streak.lastStudyDate ? new Date(streak.lastStudyDate).toDateString() : null;

    if (lastDate === today) {
      return streak;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastDate === yesterdayStr) {
      streak.currentStreak += 1;
    } else {
      streak.currentStreak = 1;
    }

    streak.lastStudyDate = new Date().toISOString();

    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    const { error } = await supabase
      .from('user_stats')
      .upsert({
        user_id: this.userId,
        streak_data: streak,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving streak data:', error);
    }

    return streak;
  }
}


