# Flashcard App 📚

A modern, mobile-first flashcard application for language learning, built with React and Tailwind CSS. Features spaced repetition algorithm (SM-2) for optimal learning efficiency.

## ✨ Features

- **Deck Management**: Create, edit, and delete flashcard decks
- **Card Management**: Add individual cards or bulk import via CSV
- **Study Mode**: Interactive flashcard interface with flip animations
- **Spaced Repetition**: SM-2 algorithm for optimal review scheduling
- **Dark Theme**: Beautiful dark mode throughout
- **Mobile-First**: Optimized for mobile devices, responsive for desktop
- **Offline-Capable**: All data stored locally using localStorage

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 How to Use

### Creating a Deck

1. Click "New Deck" button
2. Enter deck name and optional description
3. Click "Create Deck"

### Adding Cards

**Single Card (Quizlet-style inline editor):**
1. Open a deck
2. Click "Add Card"
3. An inline editor appears at the top of your card list
4. Enter front text (left) and back text (right) side-by-side
5. (Optional) Click the 📷 image icon to add an image URL
6. Click the ✓ checkmark to save (or press `Ctrl+Enter`)
7. Press `Esc` or click ✕ to cancel

**Bulk Add:**
1. Open a deck
2. Click "Bulk Add"
3. Enter cards in CSV format: `front,back,imageURL`
4. Click "Import Cards"

Example:
```
Hello,Hola,https://example.com/hello.jpg
Goodbye,Adiós
Thank you,Gracias
```

### Studying

1. Open a deck
2. Click "Study Now" (only available when cards are due)
3. Tap card to flip and see the answer
4. Rate your recall (1-5):
   - 1 = Again (didn't remember)
   - 2 = Hard (barely remembered)
   - 3 = Good (remembered with effort)
   - 4 = Easy (remembered easily)
   - 5 = Perfect (knew instantly)

The app will automatically schedule the next review based on your rating!

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **LocalStorage** - Client-side data persistence
- **SM-2 Algorithm** - Spaced repetition scheduling

## 📁 Project Structure

```
flashcards/
├── src/
│   ├── components/       # React components
│   ├── context/          # React Context for state management
│   ├── utils/            # Utility functions
│   │   ├── storage.js           # LocalStorage operations
│   │   ├── spacedRepetition.js  # SM-2 algorithm
│   │   └── csvParser.js         # CSV parsing
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
└── index.html            # HTML template
```

## 🎨 Design Principles

- **Mobile-First**: Touch-friendly, optimized for small screens
- **Simplicity**: Clean, intuitive Quizlet-like interface
- **Performance**: Fast load times, minimal dependencies
- **Accessibility**: Proper semantic HTML, keyboard navigation

## 🔒 Data Storage

All data is stored locally in your browser's localStorage under the key `flashcards_data`. No data is sent to any server, ensuring complete privacy.

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

Built with ❤️ for language learners everywhere
# my_flashcards_app
