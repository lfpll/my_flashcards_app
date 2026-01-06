import { supabase } from '../lib/supabase';

const MIGRATION_FLAG = 'flashcards_migrated';

export interface MigrationResult {
  success: boolean;
  error?: any;
  message?: string;
}

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

export async function migrateLocalStorageToSupabase(userId: string): Promise<MigrationResult> {
  const migrationKey = `${MIGRATION_FLAG}_${userId}`;
  
  try {
    // If Supabase is not configured, skip migration
    if (!supabase) {
      console.warn('Supabase not configured, skipping migration');
      return {
        success: false,
        message: 'Supabase not configured'
      };
    }
    
    // Load localStorage data
    const dataStr = localStorage.getItem('flashcards_data');
    if (!dataStr) {
      console.log('No local data to migrate');
      return {
        success: true,
        message: 'No local data to migrate'
      };
    }
    
    const data = JSON.parse(dataStr);
    const localDecks = data.decks || [];
    
    if (localDecks.length === 0) {
      console.log('No decks to migrate');
      return {
        success: true,
        message: 'No decks to migrate'
      };
    }
    
    // Get existing decks from Supabase to avoid duplicates
    const { data: existingDecks } = await supabase
      .from('decks')
      .select('id, name, created_at, updated_at')
      .eq('user_id', userId);
    
    const existingDeckMap = new Map(
      (existingDecks || []).map((d: any) => [d.name.toLowerCase().trim(), d])
    );
    
    console.log(`🔄 Syncing ${localDecks.length} local decks with Supabase...`);
    
    // Track all errors
    const errors: any[] = [];
    const migratedDeckIds: string[] = [];
    
    // Migrate each deck (merge intelligently)
    for (const localDeck of localDecks) {
      try {
        const deckKey = localDeck.name.toLowerCase().trim();
        const existingDeck = existingDeckMap.get(deckKey);
        
        let deckId: string;
        
        if (existingDeck) {
          // Deck exists - check if local is newer
          const localUpdated = new Date(localDeck.updatedAt || localDeck.createdAt).getTime();
          const supabaseUpdated = new Date(existingDeck.updated_at).getTime();
          
          if (localUpdated > supabaseUpdated) {
            // Local is newer - update Supabase deck
            const { error: updateError } = await supabase
              .from('decks')
              .update({
                description: localDeck.description,
                updated_at: safeToISOString(localDeck.updatedAt)
              })
              .eq('id', existingDeck.id);
            
            if (updateError) {
              console.warn(`⚠️ Failed to update deck "${localDeck.name}":`, updateError);
            } else {
              console.log(`🔄 Updated deck: "${localDeck.name}" (local was newer)`);
            }
          } else {
            console.log(`⏭️ Skipping deck "${localDeck.name}" (Supabase is newer or same)`);
          }
          
          deckId = existingDeck.id;
        } else {
          // New deck - insert it
          const { data: newDeck, error: deckError } = await supabase
            .from('decks')
            .insert({
              user_id: userId,
              name: localDeck.name,
              description: localDeck.description,
              created_at: safeToISOString(localDeck.createdAt),
              updated_at: safeToISOString(localDeck.updatedAt)
            })
            .select()
            .single();
          
          if (deckError) {
            errors.push({ type: 'deck', name: localDeck.name, error: deckError });
            console.error(`❌ Failed to migrate deck "${localDeck.name}":`, deckError);
            continue; // Continue with other decks instead of failing completely
          }
          
          console.log(`✅ Migrated deck: "${localDeck.name}"`);
          deckId = newDeck.id;
          migratedDeckIds.push(newDeck.id);
        }
        
        // Sync cards for this deck
        if (localDeck.cards && localDeck.cards.length > 0) {
          // Get existing cards for this deck
          const { data: existingCards } = await supabase
            .from('cards')
            .select('id, front, back, created_at')
            .eq('deck_id', deckId)
            .eq('user_id', userId);
          
          const existingCardMap = new Map(
            (existingCards || []).map((c: any) => [
              `${c.front.toLowerCase().trim()}|${c.back.toLowerCase().trim()}`,
              c
            ])
          );
          
          const cardsToInsert: any[] = [];
          
          for (const localCard of localDeck.cards) {
            const cardKey = `${(localCard.front || '').toLowerCase().trim()}|${(localCard.back || '').toLowerCase().trim()}`;
            const existingCard = existingCardMap.get(cardKey);
            
            if (!existingCard) {
              // New card - add to insert list
              cardsToInsert.push({
                deck_id: deckId,
                user_id: userId,
                front: localCard.front,
                back: localCard.back,
                front_image: localCard.frontImageUrl || null,
                back_image: localCard.backImageUrl || null,
                ease_factor: localCard.easeFactor || 2.5,
                interval: localCard.interval || 0,
                repetitions: localCard.repetitions || 0,
                next_review: safeToISOString(localCard.nextReview),
                created_at: safeToISOString(localCard.createdAt)
              });
            }
            // If card exists, we skip it (Supabase version is authoritative)
          }
          
          if (cardsToInsert.length > 0) {
            const { error: cardsError } = await supabase
              .from('cards')
              .insert(cardsToInsert);
            
            if (cardsError) {
              errors.push({ type: 'cards', deck: localDeck.name, error: cardsError });
              console.error(`❌ Failed to migrate ${cardsToInsert.length} cards for deck "${localDeck.name}":`, cardsError);
            } else {
              console.log(`  ✅ Migrated ${cardsToInsert.length} new cards`);
            }
          } else {
            console.log(`  ⏭️ No new cards to migrate for "${localDeck.name}"`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing deck "${localDeck.name}":`, error);
        errors.push({ type: 'deck', name: localDeck.name, error });
        // Continue with other decks
      }
    }
    
    // Migrate streak data (always merge)
    try {
      const streakStr = localStorage.getItem('flashcards_streak');
      if (streakStr) {
        const localStreak = JSON.parse(streakStr);
        
        // Get existing streak from Supabase
        const { data: existingStats } = await supabase
          .from('user_stats')
          .select('streak_data')
          .eq('user_id', userId)
          .single();
        
        const supabaseStreak = existingStats?.streak_data || {};
        
        // Merge: use the better streak (higher currentStreak or more recent lastStudyDate)
        const mergedStreak = {
          currentStreak: Math.max(
            localStreak.currentStreak || 0,
            supabaseStreak.currentStreak || 0
          ),
          longestStreak: Math.max(
            localStreak.longestStreak || 0,
            supabaseStreak.longestStreak || 0
          ),
          lastStudyDate: localStreak.lastStudyDate && supabaseStreak.lastStudyDate
            ? (new Date(localStreak.lastStudyDate) > new Date(supabaseStreak.lastStudyDate)
                ? localStreak.lastStudyDate
                : supabaseStreak.lastStudyDate)
            : (localStreak.lastStudyDate || supabaseStreak.lastStudyDate)
        };
        
        await supabase
          .from('user_stats')
          .upsert({
            user_id: userId,
            streak_data: mergedStreak
          });
        console.log('✅ Synced streak data');
      }
    } catch (streakError) {
      console.warn('⚠️ Failed to sync streak data (non-critical):', streakError);
    }
    
    if (errors.length > 0) {
      console.warn(`⚠️ Migration completed with ${errors.length} error(s):`, errors);
      return {
        success: false,
        error: errors,
        message: `Migration completed with ${errors.length} error(s)`
      };
    } else {
      console.log('✅ Sync completed successfully!');
      return {
        success: true,
        message: 'Sync completed successfully'
      };
    }
    
  } catch (error) {
    console.error('❌ SYNC FAILED:', error);
    return {
      success: false,
      error,
      message: 'Migration failed with an unexpected error'
    };
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

