# Flashcard App - Project Overview

## Overview
A mobile-first, single-page flashcard application for language learning with spaced repetition (SM-2 algorithm). Built with React, features offline-capable localStorage persistence, dark theme UI, and Quizlet-inspired UX.

## Tech Stack
- **React 19** with Hooks
- **Vite 7** for build/dev tooling
- **Tailwind CSS 4** for styling
- **LocalStorage** for data persistence (no backend)
- **uuid** for ID generation
- **Light/Dark Theme** with context-based theming

## Architecture

### State Management
- **React Context API**: Global state via `FlashcardContext` and `ToastContext`
- **Single Source of Truth**: All data stored in localStorage under `flashcards_data` key
- **Data Flow**: Components → Context → Storage Utils → LocalStorage

### Data Model
```javascript
{
  decks: [
    {
      id: "uuid",
      name: "string",
      description: "string",
      createdAt: timestamp,
      updatedAt: timestamp,
      cards: [
        {
          id: "uuid",
          front: "string",
          back: "string",
          frontImageUrl: "string | null",
          backImageUrl: "string | null",
          // Spaced repetition metadata (SM-2)
          easeFactor: 2.5,      // Learning efficiency multiplier
          interval: 1,          // Days until next review
          repetitions: 0,       // Consecutive successful reviews
          nextReview: timestamp,
          lastReviewed: timestamp,
          reviews: [{ rating: 1-5, date: timestamp }]
        }
      ]
    }
  ]
}
```

### Navigation Pattern
Simple view-based routing in `App.jsx`:
- **list**: Deck list (home screen)
- **detail**: Deck detail with card management
- **study**: Study session with flashcards

No React Router - state-based view switching with `currentView` and `selectedDeckId`.

## Core Modules

### `/src/utils/`

**`storage.js`** - LocalStorage operations
- CRUD for decks and cards
- Single storage key: `flashcards_data`
- Handles quota exceeded errors
- All functions are synchronous

**`spacedRepetition.js`** - SM-2 algorithm
- `updateCardWithRating(card, rating)`: Updates card based on 1-5 rating
- `getDueCards(deck)`: Filters cards where `nextReview <= now`
- Algorithm: Adjusts `interval` and `easeFactor` based on performance

**`csvParser.js`** - CSV parsing for bulk import
- Format: `front,back,frontImageUrl,backImageUrl` (image URLs optional)

**`imageUpload.js`** - Image upload utilities
- `convertImageToBase64(file, maxWidth)`: Converts uploaded images to base64
- Auto-resizes images (default max width: 800px)
- Compresses to JPEG at 85% quality
- 5MB file size limit

### `/src/context/`

**`FlashcardContext.jsx`**
- Provides: `decks`, `loading`, CRUD operations
- Hooks: `useFlashcards()`
- Auto-refreshes state after mutations

**`ToastContext.jsx`**
- Global toast notifications
- Hooks: `useToast()`

**`ThemeContext.jsx`**
- Theme switching (light/dark)
- Hooks: `useTheme()`
- Persists preference in localStorage

### `/src/components/`

**Core Views:**
- `DeckList.jsx`: Home screen, displays all decks
- `DeckDetail.jsx`: Shows deck cards, manages add/edit/delete
- `StudySession.jsx`: Study mode with flashcard flow

**UI Components:**
- `FlashCard.jsx`: Flippable card with 3D animation
- `InlineCardEditor.jsx`: Quizlet-style side-by-side editor (front/back fields)
- `RatingButtons.jsx`: 1-5 rating buttons for spaced repetition
- `BulkAddForm.jsx`: CSV input for bulk card import

**Reusable:**
- `Modal.jsx`, `ConfirmDialog.jsx`, `Toast.jsx`
- `Button.jsx`, `FormInput.jsx`, `FormTextarea.jsx`
- `DeckCard.jsx`: Individual deck card in list

## Spaced Repetition (SM-2)

**How It Works:**
  1. User rates card 1-5 after reviewing
  2. Rating 1-2: Card resets to 1-day interval (failed recall)
  3. Rating 3-5: Interval increases (successful recall)
   - First success: 1 day
   - Second success: 6 days
   - Subsequent: interval × easeFactor
4. `easeFactor` adjusts based on rating quality (min 1.3)
5. `nextReview` = now + (interval × 24h)

**Key Algorithm Details:**
- Quality conversion: `quality = rating - 1` (converts 1-5 to 0-5)
- Ease factor formula: `EF' = EF + (0.1 - (5-q) × (0.08 + (5-q) × 0.02))`
- New cards: `nextReview = Date.now()` (immediately due)

## Component Patterns

### Inline Card Editor
Quizlet-style UX:
- Appears at top of card list when "Add Card" clicked
- Side-by-side front/back textareas
- Keyboard shortcuts: Ctrl+Enter (save), Esc (cancel)
- Image support:
  - Upload images directly (converted to base64)
  - Or paste image URLs
  - Image preview thumbnails
  - Hover to remove uploaded images

### Study Session Flow
1. Filter due cards (`nextReview <= now`)
2. Display card front (tap to flip)
3. Show back + rating buttons after flip
4. Auto-advance to next card on rating
5. Show completion screen when done
6. Progress bar + counter (X / Y cards)

### Toast Notifications
Global feedback via `useToast()`:
```javascript
const { showToast } = useToast();
showToast('Deck created!', 'success');
```

## Styling System

**Tailwind Custom Theme:**

**Dark Theme (default):**
```css
dark-bg:         #1a1a1a (page background)
dark-card:       #2a2a2a (card backgrounds)
dark-lighter:    #3a3a3a (borders, dividers)
dark-text:       #f0f0f0 (primary text)
dark-textDim:    #a0a0a0 (secondary text)
accent-primary:  #6366f1 (indigo, interactive elements)
```

**Light Theme:**
```css
light-bg:        #f5f5f5 (page background)
light-card:      #ffffff (card backgrounds with shadows)
light-lighter:   #e5e5e5 (borders, dividers)
light-text:      #1a1a1a (primary text)
light-textDim:   #666666 (secondary text)
accent-primary:  #6366f1 (same accent color)
```

**Custom Classes** (in `index.css`):
- `.input-base`, `.textarea-base`: Form inputs
- `.btn-primary`, `.btn-secondary`: Buttons
- `.card-base`: Card containers

## Development Workflow

### Running the App
```bash
npm install
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build
npm run preview    # Preview production build
```

### Adding a New Feature
1. Create component in `/src/components/`
2. Use `useFlashcards()` for deck/card operations
3. Call storage utils directly only if needed (context preferred)
4. Add toast notifications for user feedback
5. Ensure mobile-first responsive design

### Testing Spaced Repetition
1. Create deck with cards
2. Study and rate cards
3. Check console/localStorage to verify:
   - `interval` increases with good ratings
   - `easeFactor` adjusts based on quality
   - `nextReview` schedules correctly
4. Fast-forward time (modify `nextReview` in localStorage) to test due cards

## Key Design Decisions

**Why no React Router?**
- Simple 3-view navigation doesn't need routing library
- Reduces bundle size
- State-based navigation is sufficient

**Why LocalStorage?**
- Offline-capable, no backend needed
- Instant data persistence
- Privacy: no data leaves device

**Why Context over Redux?**
- Simple state requirements
- Built-in React solution
- Less boilerplate

**Why SM-2 Algorithm?**
- Proven spaced repetition method (used by Anki)
- Simple to implement
- Effective for language learning

## Common Tasks

### Add New Deck Operation
1. Add function to `src/utils/storage.js`
2. Add method to `FlashcardContext.jsx`
3. Call via `useFlashcards()` in component

### Modify Card Structure
1. Update `createCard()` in `storage.js`
2. Update existing data migration if needed
3. Update TypeScript types if using TS

### Add New View
1. Create component in `/src/components/`
2. Add view state to `App.jsx` (`currentView`)
3. Add navigation functions
4. Wire up in App's conditional rendering

## File Organization
```
src/
├── components/     # All React components
│   ├── *List.jsx   # List views
│   ├── *Detail.jsx # Detail views
│   ├── *Form.jsx   # Forms and modals
│   └── *.jsx       # Reusable UI components
├── context/        # React Context providers
├── hooks/          # Custom React hooks
├── utils/          # Pure utility functions
│   ├── storage.js         # LocalStorage CRUD
│   ├── spacedRepetition.js # SM-2 algorithm
│   └── csvParser.js       # CSV parsing
├── App.jsx         # Main app with view routing
├── main.jsx        # React entry point
└── index.css       # Global styles + Tailwind
```

## Data Persistence
- **Storage Key**: `flashcards_data`
- **Format**: JSON string
- **Size Limit**: ~5-10MB (browser dependent)
- **Error Handling**: `QuotaExceededError` caught in `saveData()`
- **Images**: Stored as base64 data URLs (auto-resized and compressed)

## Mobile Optimization
- Touch-friendly targets (min 44×44px)
- Swipe gestures on flashcards
- Tap to flip cards (entire card is tappable)
- Bottom-heavy UI (important actions at thumb reach)
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)

## Future Considerations
- Export/import decks as JSON
- PWA capabilities (offline, install prompt)
- Statistics dashboard
- Audio pronunciation support
- Tags and filtering
- Cloud sync (requires backend)

## Troubleshooting

**LocalStorage not persisting?**
- Check browser privacy settings
- Verify localStorage is enabled
- Check quota (5-10MB typical limit)

**Cards not showing as due?**
- Check `nextReview` timestamp in localStorage
- Verify `getDueCards()` filtering logic
- Ensure system time is correct

**Spaced repetition not working?**
- Console log card before/after rating
- Verify `updateCardWithRating()` returns updated object
- Check `modifyCard()` persists changes

---

**For questions or contributions**: Check existing components for patterns, follow mobile-first design, and ensure dark theme consistency.
