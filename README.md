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
- **Supabase** - Authentication and cloud database
- **LocalStorage** - Client-side data persistence (anonymous mode)
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

### Anonymous Mode
All data is stored locally in your browser's localStorage under the key `flashcards_data`. No data is sent to any server, ensuring complete privacy.

### Authenticated Mode
When you sign up or log in, your data is synced to Supabase cloud database. Any existing localStorage data is automatically migrated to your account on first login.

## 🔐 Supabase Authentication Setup

This app uses Supabase for user authentication and cloud data storage. Follow these steps to set up your own Supabase project:

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up for a free account
2. Create a new project
3. Wait for your project to be fully provisioned (this may take a few minutes)

### 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy your **anon/public** key (NOT the service_role key!)

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### 4. Create Database Tables

Run these SQL commands in the Supabase SQL Editor (**SQL Editor** in the sidebar):

```sql
-- Create decks table
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cards table
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  front_image_url TEXT,
  back_image_url TEXT,
  ease_factor NUMERIC DEFAULT 2.5,
  interval INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review BIGINT NOT NULL,
  last_reviewed BIGINT,
  reviews JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_stats table
CREATE TABLE user_stats (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  streak_data JSONB DEFAULT '{}',
  gamification_data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_cards_deck_id ON cards(deck_id);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
```

### 5. Enable Row Level Security (RLS)

Run these commands to enable RLS and set up security policies:

```sql
-- Enable RLS on all tables
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Decks policies
CREATE POLICY "Users can view their own decks"
  ON decks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decks"
  ON decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks"
  ON decks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks"
  ON decks FOR DELETE
  USING (auth.uid() = user_id);

-- Cards policies
CREATE POLICY "Users can view their own cards"
  ON cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cards"
  ON cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards"
  ON cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards"
  ON cards FOR DELETE
  USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view their own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON user_stats FOR ALL
  USING (auth.uid() = user_id);
```

### 6. Configure Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. (Optional) Configure email templates under **Authentication** → **Email Templates**

### 7. Start the App

```bash
npm run dev
```

You're all set! Users can now sign up, log in, and their data will be synced to Supabase.

## 🔄 Data Migration

When a user signs up or logs in for the first time:
- Any existing localStorage data is automatically migrated to their Supabase account
- The migration preserves all deck/card data and spaced repetition progress
- localStorage data is kept as a backup but won't be used while logged in

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

Built with ❤️ for language learners everywhere
# my_flashcards_app
# my_flashcards_app
