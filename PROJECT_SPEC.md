# Flashcard App - Technical Specification Document

**Project Type:** Single Page Application (SPA)  
**Target Platform:** Mobile-first web application  
**Storage:** LocalStorage (no backend required)  
**Theme:** Dark theme throughout  

---

## 1. Project Overview

Build a simple flashcard application for language learning, inspired by Anki and Quizlet. The app allows users to create decks of flashcards, study them, and track their learning progress using a spaced repetition algorithm.

### Key Principles
- **Mobile-first design** - Optimize for mobile devices, responsive for desktop
- **Simplicity** - Clean, intuitive Quizlet-like interface
- **Offline-capable** - All data stored locally, no backend dependency
- **Dark theme** - All screens use dark mode styling

---

## 2. Core Features

### 2.1 Deck Management

**Create Deck**
- Input fields: Deck name (required), description (optional)
- Generate unique ID for each deck
- Store creation timestamp
- Save to localStorage

**View All Decks**
- Display list/grid of all decks
- Show for each deck:
  - Deck name
  - Total card count
  - Number of cards due for review
  - Last studied date (optional)
- Empty state when no decks exist

**Edit Deck**
- Modify deck name and description
- Update timestamp

**Delete Deck**
- Show confirmation dialog
- Remove deck and all associated cards
- Update localStorage

### 2.2 Card Management

**Card Structure**
- Front: Text content (required)
- Back: Text content (required)  
- Image URL: Optional image to display on the card
- Spaced repetition metadata (see section 2.4)

**Create Single Card**
- Form with three inputs:
  - Front text (textarea)
  - Back text (textarea)
  - Image URL (text input)
- Generate unique card ID
- Initialize spaced repetition parameters
- Add to selected deck

**Edit Card**
- Pre-populate form with existing card data
- Allow modification of front, back, and image URL
- Preserve spaced repetition metadata

**Delete Single Card**
- Remove card from deck
- Update localStorage

**Bulk Add Cards**
- Provide textarea for CSV input
- Expected format: `front,back,imageURL` (one card per line)
- Image URL is optional: `front,back` is valid
- Example:
  ```
  Hello,Hola,https://example.com/hello.jpg
  Goodbye,Adiós
  Thank you,Gracias,https://example.com/thanks.jpg
  ```
- Parse CSV and create multiple cards at once
- Show success message with count of cards added

**Bulk Delete Cards**
- Display card list with checkboxes
- Allow multi-select
- "Delete Selected" button appears when cards are selected
- Show confirmation dialog with count
- Remove selected cards from deck

### 2.3 Study Mode

**Starting a Study Session**
- User selects a deck from the deck list
- Tap "Study Now" button
- Filter cards that are due for review (nextReview <= current date)
- If no cards due, show message "No cards to review. Check back later!"
- Load cards into study session

**Card Display**
- Initially show the FRONT of the card
- Center-align text
- Display image below text if imageUrl exists
- Large tap target (entire card area is tappable)

**Card Interaction**
- User taps card to flip
- Animate flip transition (front → back)
- Back shows the answer text and image (if available)
- Rating buttons (1-5) appear after flip

**Rating System**
- After viewing the back, user rates how well they remembered:
  - **1** - Again (didn't remember at all)
  - **2** - Hard (barely remembered)
  - **3** - Good (remembered with effort)
  - **4** - Easy (remembered easily)
  - **5** - Perfect (knew it instantly)
- Rating triggers spaced repetition algorithm update
- Automatically advance to next card

**Progress Tracking**
- Show progress indicator: "5 / 20 cards"
- Progress bar (optional visual enhancement)

**Session End**
- When all due cards are reviewed, show completion screen
- Display summary: "Session complete! You reviewed X cards."
- "Back to Deck" button
- User can also exit mid-session via "Exit" button in header

### 2.4 Spaced Repetition Algorithm

**Algorithm Choice:** SM-2 (SuperMemo 2)

**Card Metadata Structure**
```javascript
{
  id: "uuid",
  front: "string",
  back: "string",
  imageUrl: "string | null",
  
  // Spaced repetition fields
  easeFactor: 2.5,        // Initial ease factor
  interval: 1,            // Days until next review (initial: 1 day)
  repetitions: 0,         // Number of consecutive successful reviews
  nextReview: timestamp,  // Date when card is due for review
  lastReviewed: timestamp,
  
  reviews: [              // History of reviews (optional for tracking)
    { rating: 4, date: timestamp }
  ]
}
```

**SM-2 Algorithm Implementation**

After each rating (1-5), update the card:

```javascript
function updateCard(card, rating) {
  // Convert 1-5 rating to 0-5 quality (SM-2 expects 0-5)
  const quality = rating - 1;
  
  if (quality < 3) {
    // Failed recall - reset repetitions
    card.repetitions = 0;
    card.interval = 1;
  } else {
    // Successful recall
    if (card.repetitions === 0) {
      card.interval = 1;
    } else if (card.repetitions === 1) {
      card.interval = 6;
    } else {
      card.interval = Math.round(card.interval * card.easeFactor);
    }
    card.repetitions += 1;
  }
  
  // Update ease factor
  card.easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Ease factor should not fall below 1.3
  if (card.easeFactor < 1.3) {
    card.easeFactor = 1.3;
  }
  
  // Set next review date
  card.nextReview = Date.now() + (card.interval * 24 * 60 * 60 * 1000);
  card.lastReviewed = Date.now();
  
  // Add to review history
  card.reviews.push({ rating, date: Date.now() });
  
  return card;
}
```

**Due Cards Logic**
```javascript
function getDueCards(deck) {
  const now = Date.now();
  return deck.cards.filter(card => card.nextReview <= now);
}
```

### 2.5 UI/UX Requirements

**Theme**
- Dark background (#1a1a1a or similar)
- Light text (#ffffff or #f0f0f0)
- Accent color for interactive elements (e.g., blue, purple)
- Card backgrounds slightly lighter than page background (#2a2a2a)

**Mobile-First Layout**
- Touch-friendly button sizes (minimum 44x44px)
- Large tap targets for cards (full card area)
- Bottom navigation or floating action button for primary actions
- Responsive breakpoints for tablet/desktop

**Animations**
- Card flip animation (3D rotate effect)
- Smooth transitions between screens
- Button press feedback

**User Feedback**
- Loading states (if needed)
- Success messages (e.g., "Deck created!", "Cards imported!")
- Error messages (e.g., "Please fill in required fields")
- Confirmation dialogs for destructive actions

---

## 3. Data Model

### 3.1 LocalStorage Structure

Store all data in localStorage under a single key: `flashcards_data`

```json
{
  "decks": [
    {
      "id": "uuid-1",
      "name": "Spanish Basics",
      "description": "Common phrases for beginners",
      "createdAt": 1727654400000,
      "updatedAt": 1727654400000,
      "cards": [
        {
          "id": "card-uuid-1",
          "front": "Hello",
          "back": "Hola",
          "imageUrl": "https://example.com/hello.jpg",
          "easeFactor": 2.5,
          "interval": 1,
          "repetitions": 0,
          "nextReview": 1727654400000,
          "lastReviewed": null,
          "reviews": []
        },
        {
          "id": "card-uuid-2",
          "front": "Goodbye",
          "back": "Adiós",
          "imageUrl": null,
          "easeFactor": 2.5,
          "interval": 1,
          "repetitions": 0,
          "nextReview": 1727654400000,
          "lastReviewed": null,
          "reviews": []
        }
      ]
    }
  ]
}
```

### 3.2 Helper Functions

**Storage Operations**
```javascript
// Load all data
function loadData() {
  const data = localStorage.getItem('flashcards_data');
  return data ? JSON.parse(data) : { decks: [] };
}

// Save all data
function saveData(data) {
  localStorage.setItem('flashcards_data', JSON.stringify(data));
}

// Get all decks
function getAllDecks() {
  return loadData().decks;
}

// Get deck by ID
function getDeckById(deckId) {
  const data = loadData();
  return data.decks.find(deck => deck.id === deckId);
}

// Create deck
function createDeck(name, description) {
  const data = loadData();
  const newDeck = {
    id: generateUUID(),
    name,
    description,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    cards: []
  };
  data.decks.push(newDeck);
  saveData(data);
  return newDeck;
}

// Similar functions for update, delete, card operations...
```

---

## 4. Screen Flow & Wireframes

### 4.1 Screen Hierarchy

```
App Root
├── Home / Deck List Screen
│   ├── Header: "My Decks"
│   ├── Deck Grid/List
│   │   └── Deck Card (name, card count, due count)
│   └── FAB: "+" (Create Deck)
│
├── Deck Detail Screen
│   ├── Header: Deck Name (with Edit/Delete options)
│   ├── "Study Now" Button (shows due count)
│   ├── "Add Card" Button
│   ├── "Bulk Add" Button
│   ├── Card List
│   │   └── Card Item (front preview, edit/delete icons)
│   └── Bulk Delete Mode Toggle
│
├── Create/Edit Deck Modal
│   ├── Deck Name Input
│   ├── Description Textarea
│   └── Save / Cancel Buttons
│
├── Create/Edit Card Screen
│   ├── Front Textarea
│   ├── Back Textarea
│   ├── Image URL Input
│   └── Save / Cancel Buttons
│
├── Bulk Add Screen
│   ├── Instructions Text
│   ├── Large Textarea (CSV input)
│   ├── Format Example
│   └── Import / Cancel Buttons
│
└── Study Session Screen
    ├── Header: Progress (X / Y) and Exit Button
    ├── Card Display Area (tappable)
    │   ├── Text (front or back)
    │   └── Image (if available)
    └── Rating Buttons (1-5, shown after flip)
```

### 4.2 Navigation Patterns

**Mobile Navigation**
- Use slide-in transitions between screens
- Back button in header for sub-screens
- Bottom sheet modals for quick actions

**Study Mode**
- Full-screen immersive mode
- Exit button in top-left
- Minimal distractions

---

## 5. Technical Stack

### 5.1 Recommended Technologies

**Frontend Framework**
- **React** (recommended) with Hooks
- Alternative: Vue 3 with Composition API

**Styling**
- **TailwindCSS** for utility-first styling and dark theme
- Alternative: Styled-components or CSS Modules

**State Management**
- React Context API or simple state management (no Redux needed)
- LocalStorage wrapper for persistence

**Utilities**
- **uuid** for generating unique IDs
- **date-fns** for date manipulation (optional)

**Build Tool**
- **Vite** for fast development and building

### 5.2 Project Structure

```
flashcards/
├── src/
│   ├── components/
│   │   ├── DeckList.jsx
│   │   ├── DeckCard.jsx
│   │   ├── DeckDetail.jsx
│   │   ├── CardList.jsx
│   │   ├── CardForm.jsx
│   │   ├── BulkAddForm.jsx
│   │   ├── StudySession.jsx
│   │   ├── FlashCard.jsx
│   │   ├── RatingButtons.jsx
│   │   └── ProgressBar.jsx
│   ├── utils/
│   │   ├── storage.js        // LocalStorage helpers
│   │   ├── spacedRepetition.js  // SM-2 algorithm
│   │   └── csvParser.js      // CSV parsing for bulk add
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 6. Implementation Order

### Phase 1: Foundation (Day 1)
1. Set up project with Vite + React + TailwindCSS
2. Configure dark theme in Tailwind
3. Create localStorage utility functions
4. Implement data model and helper functions
5. Build basic routing/navigation

### Phase 2: Deck Management (Day 1-2)
6. Build Deck List screen with empty state
7. Create Deck modal/form (name, description)
8. Display decks in a grid/list
9. Implement edit deck functionality
10. Implement delete deck with confirmation

### Phase 3: Card Management (Day 2)
11. Build Deck Detail screen
12. Create Card Form (add/edit single card)
13. Display card list in deck detail
14. Implement delete card functionality
15. Add image URL support with preview

### Phase 4: Study Mode (Day 2-3)
16. Build Study Session screen
17. Implement card flip animation (tap to flip)
18. Add rating buttons (1-5)
19. Show progress counter
20. Handle session completion

### Phase 5: Spaced Repetition (Day 3)
21. Implement SM-2 algorithm in spacedRepetition.js
22. Integrate algorithm with rating system
23. Filter due cards for study sessions
24. Display due card count on deck cards

### Phase 6: Bulk Operations (Day 3-4)
25. Build Bulk Add form with CSV input
26. Implement CSV parser
27. Add bulk add functionality
28. Implement bulk delete (checkbox selection)

### Phase 7: Polish (Day 4)
29. Add animations and transitions
30. Improve mobile responsiveness
31. Add loading states and error handling
32. Add success/error toast notifications
33. Test on multiple devices/browsers

---

## 7. Acceptance Criteria

### User Stories & Acceptance Tests

**US1: As a user, I want to create a deck so I can organize my flashcards.**
- ✅ I can tap "Create Deck" button
- ✅ I can enter a deck name (required)
- ✅ I can enter a deck description (optional)
- ✅ Deck appears in my deck list after creation
- ✅ Deck shows 0 cards initially

**US2: As a user, I want to add cards to a deck.**
- ✅ I can tap "Add Card" from deck detail
- ✅ I can enter front text (required)
- ✅ I can enter back text (required)
- ✅ I can optionally add an image URL
- ✅ Card appears in the deck's card list
- ✅ Deck card count increases

**US3: As a user, I want to bulk add multiple cards at once.**
- ✅ I can tap "Bulk Add" button
- ✅ I can paste CSV formatted text (front,back,imageURL)
- ✅ System parses CSV and creates multiple cards
- ✅ I see a success message with count of cards added
- ✅ All cards appear in the deck

**US4: As a user, I want to study a deck using flashcards.**
- ✅ I can tap "Study Now" on a deck
- ✅ I see the front of the first card
- ✅ I can tap the card to flip it
- ✅ I see the back of the card after flipping
- ✅ I see rating buttons (1-5) after flip
- ✅ After rating, the next card appears automatically
- ✅ I see my progress (e.g., "3 / 10")
- ✅ I see images if the card has an imageUrl

**US5: As a user, I want my card ratings to affect when I see them again.**
- ✅ Rating a card as 1-2 shows it again soon
- ✅ Rating a card as 3-5 increases the review interval
- ✅ Cards not yet due don't appear in study sessions
- ✅ I see a count of due cards on each deck
- ✅ If no cards are due, I see a message

**US6: As a user, I want to delete multiple cards at once.**
- ✅ I can enable bulk delete mode
- ✅ I see checkboxes next to each card
- ✅ I can select multiple cards
- ✅ I see a "Delete Selected" button
- ✅ System asks for confirmation
- ✅ Selected cards are removed

**US7: As a user, I want a dark-themed mobile interface.**
- ✅ All screens use dark backgrounds
- ✅ Text is light colored for readability
- ✅ Interface is responsive on mobile devices
- ✅ Buttons are large enough to tap easily
- ✅ Cards are easy to read on small screens

---

## 8. Edge Cases & Error Handling

### Data Validation
- Deck name cannot be empty
- Card front and back cannot be empty
- Image URL validation (optional): Check if URL is well-formed
- CSV parsing errors: Show line numbers with issues

### Empty States
- No decks: Show welcome message with "Create Your First Deck" CTA
- No cards in deck: Show message with "Add Cards to Start Studying" CTA
- No due cards: Show message "No cards to review. Great work!"

### Confirmation Dialogs
- Delete deck: "Are you sure? This will delete X cards."
- Delete cards: "Delete X selected cards? This cannot be undone."
- Exit study session: "Exit study session? Progress will be saved."

### Image Handling
- Broken image URLs: Show placeholder or hide image
- Missing image: Don't display image container
- Image loading: Consider lazy loading for performance

### LocalStorage Limits
- Monitor localStorage size (typically 5-10MB limit)
- Handle quota exceeded errors gracefully
- Show warning if approaching limits

---

## 9. Future Enhancements (Out of Scope for MVP)

These features are intentionally excluded from the initial version but could be considered later:

- User authentication and cloud sync
- Export/import decks as JSON files
- Statistics dashboard (charts, streaks, heatmaps)
- Audio pronunciation support
- Rich text formatting (bold, italic, highlights)
- Tags and categories for cards
- Search and filter functionality
- Multiple card types (cloze deletion, multiple choice)
- Shared/community deck library
- Desktop keyboard shortcuts
- Advanced accessibility features (screen reader support)
- Progressive Web App (PWA) capabilities

---

## 10. Development Guidelines

### Code Quality
- Write clean, readable code with meaningful variable names
- Comment complex logic (especially spaced repetition algorithm)
- Use consistent formatting (Prettier)
- Follow React best practices (hooks, component composition)

### Performance
- Avoid unnecessary re-renders (React.memo, useMemo, useCallback)
- Lazy load images in card lists
- Debounce text input in forms
- Keep localStorage operations efficient

### Mobile Optimization
- Test on real mobile devices (iOS Safari, Chrome Android)
- Ensure touch targets are at least 44x44px
- Optimize images for mobile data
- Use mobile-first CSS breakpoints

### Browser Support
- Target modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Test localStorage availability
- Handle localStorage quota errors

---

## 11. Testing Checklist

Before considering the project complete, verify:

- [ ] Can create, edit, and delete decks
- [ ] Can create, edit, and delete cards
- [ ] Can bulk add cards via CSV
- [ ] Can bulk delete cards with checkboxes
- [ ] Study mode shows cards correctly
- [ ] Card flip animation works on tap
- [ ] Rating system (1-5) works
- [ ] Spaced repetition algorithm calculates next review correctly
- [ ] Due cards count is accurate
- [ ] Progress indicator updates correctly
- [ ] Session completes when all cards reviewed
- [ ] Can exit session mid-study
- [ ] Data persists after page refresh
- [ ] Dark theme applied consistently
- [ ] Mobile responsive on various screen sizes
- [ ] Touch interactions work smoothly
- [ ] Image URLs display correctly
- [ ] Broken images handled gracefully
- [ ] Empty states display correctly
- [ ] Confirmation dialogs appear for destructive actions
- [ ] Error messages show for invalid input

---

## 12. Glossary

**Deck**: A collection of flashcards grouped together (e.g., "Spanish Basics")

**Card**: A single flashcard with a front (question/prompt) and back (answer)

**Study Session**: An active session where the user reviews due cards from a deck

**Spaced Repetition**: A learning technique that schedules reviews at increasing intervals based on recall strength

**SM-2 Algorithm**: A specific spaced repetition algorithm created by SuperMemo, using ease factors and intervals

**Due Card**: A card that is scheduled for review (nextReview <= current date)

**Rating**: User's self-assessment of how well they remembered a card (1-5 scale)

**Ease Factor**: A multiplier that affects how quickly the review interval increases (part of SM-2)

**Interval**: Number of days until the next review of a card

**Bulk Add**: Feature to add multiple cards at once via CSV format

**Bulk Delete**: Feature to delete multiple selected cards simultaneously

---

## 13. Getting Started for Developers

### Quick Start Commands

```bash
# Initialize project
npm create vite@latest flashcards -- --template react
cd flashcards
npm install

# Install dependencies
npm install uuid
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Run development server
npm run dev

# Build for production
npm run build
```

### Initial Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1a1a1a',
          card: '#2a2a2a',
          text: '#f0f0f0',
        }
      }
    },
  },
  plugins: [],
}
```

---

## 14. Questions & Clarifications

If you need clarification during development:

1. **UI/UX Decisions**: Reference Quizlet's interface for inspiration
2. **Algorithm Details**: Use standard SM-2 implementation (Google "SM-2 algorithm")
3. **Dark Theme Colors**: Use provided palette or choose similar dark theme colors
4. **Mobile Breakpoints**: Standard Tailwind breakpoints (sm: 640px, md: 768px, lg: 1024px)

---

**Document Version**: 1.0  
**Last Updated**: September 29, 2025  
**Contact**: Product Manager / Tech Lead

---

## End of Specification Document

This document contains all necessary information to build the flashcard MVP. Prioritize the features in the order specified, and ensure all acceptance criteria are met before considering the project complete.
