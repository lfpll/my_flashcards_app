# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Architecture Overview

This is a **mobile-first React flashcard application** with spaced repetition (SM-2 algorithm). All data is stored in browser localStorage - **no backend**.

### State Management Architecture

The app uses **React Context for global state**:

1. **FlashcardContext** (`src/context/FlashcardContext.jsx`)
   - Manages decks and cards data
   - Provides CRUD operations: `addDeck`, `modifyDeck`, `removeDeck`, `addCard`, `modifyCard`, `removeCard`
   - Auto-syncs with localStorage via `storage.js` utilities

2. **GamificationContext** (`src/context/GamificationContext.jsx`)
   - Tracks study streaks and session history
   - `recordStudySession()` updates streak data

3. **ThemeContext** (`src/context/ThemeContext.jsx`)
   - Controls light/dark/breeze themes
   - Applies theme via CSS custom properties

4. **ToastContext** (`src/context/ToastContext.jsx`)
   - Global notification system
   - `showToast(message, type)` for user feedback

### Navigation Pattern

**Single-page app with view-based routing** (no React Router):
- `App.jsx` manages view state: `'dashboard' | 'detail' | 'study' | 'decks' | 'stats'`
- Views switch based on `currentView` state
- Navigation functions: `navigateToDeckDetail(deckId)`, `navigateToStudy(deckId)`, `handleNavigate(view)`

### Key Utilities

1. **Spaced Repetition** (`src/utils/spacedRepetition.js`)
   - `getDueCards(deck)` - filters cards due for review
   - `getWorstPerformingCards(deck, count)` - sorts by easeFactor for practice mode
   - `updateCardWithRating(card, rating)` - applies SM-2 algorithm
   - Rating scale: 1-5 (Again/Hard/Good/Easy/Perfect)

2. **Storage** (`src/utils/storage.js`)
   - All localStorage operations
   - Storage key: `flashcards_data`
   - Card structure includes: `easeFactor`, `interval`, `repetitions`, `nextReview`, `lastReviewed`, `reviews[]`

### Component Patterns

**Dual Header Pattern** - Desktop vs Mobile layouts:
- Desktop: `<div className="hidden md:block">` - full feature set
- Mobile: `<div className="md:hidden">` - compact version
- Use responsive utilities: `sm:inline`, `md:flex`, etc.

**Inline Editing Pattern**:
- Components toggle between display and edit modes
- `InlineCardEditor` and `InlineDeckEditor` replace their display counterparts
- Controlled by parent state (e.g., `editingCardId`)

**Study Session Flow**:
1. `getDueCards()` or `getWorstPerformingCards()` to select cards
2. Snapshot cards at session start (prevents changes during study)
3. Card flip reveals answer → User rates 1-5 → `updateCardWithRating()` → Next card
4. Slide transition (right to left) between cards - NOT flip animation on card change

### Styling Conventions

- **Tailwind CSS only** - no custom CSS classes
- Theme colors via CSS variables: `--bg-color`, `--card-color`, `--text-color`, etc.
- Color palette: `accent-primary` (indigo), `success` (green), `error` (red), `warning` (orange)
- Responsive: Mobile-first, use `sm:`, `md:`, `lg:` prefixes
- Card performance indicators: Left border color based on `easeFactor` (red=struggling, green=mastered)

### Data Flow

**Card Review Cycle**:
```
User rates card → updateCardWithRating() → modifyCard() →
FlashcardContext updates → storage.js saves → localStorage persists
```

**Deck Sorting**:
- Default: creation order
- By difficulty: `sortedCards = useMemo()` sorts by `easeFactor` (lowest first)

### Important Implementation Details

1. **Card Image Sizing**: Images use `max-h-[90%]` of card height
2. **Practice Mode**: When no due cards, shows button to study 10 worst-performing cards
3. **Session Transitions**: Cards slide right-to-left with `animate-slideInFromRight` / `animate-slideOutToLeft`
4. **Flip Animation**: Only on answer reveal, NOT between cards
5. **Storage Limits**: Monitors localStorage usage, warns at 80% full

### Development Workflow (from .cursor/rules)

When adding features:
1. Research codebase for reusable components
2. Consider 3 different implementation approaches
3. Create implementation plan
4. Break into task checklist
5. Execute tasks incrementally

**Key Principles**:
- DRY code, reusable components
- Tailwind CSS classes only (no custom styles)
- Responsive CSS, avoid JS for responsive logic
- SOLID principles
- Relative sizes over absolute (rem, %, vh/vw)
