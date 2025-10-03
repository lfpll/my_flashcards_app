# Quick Start Guide 🚀

## Your app is ready! Here's how to use it:

### 1. Start the Development Server

The dev server is already running! Open your browser to:
```
http://localhost:5173
```

If you need to restart it:
```bash
npm run dev
```

---

## 2. Create Your First Deck

1. Click the **"+ New Deck"** button
2. Enter a name (e.g., "Spanish Basics")
3. Add an optional description
4. Click **"Create Deck"**

---

## 3. Add Some Cards

### Option A: Add One Card at a Time (Inline Editor)
1. Click on your deck
2. Click **"+ Add Card"**
3. An inline editor appears at the top of the list
4. Enter side-by-side:
   - **Front** (left): "Hello"
   - **Back** (right): "Hola"
5. (Optional) Click the 📷 icon and add an image URL
6. Click the **✓ checkmark** to save (or press `Ctrl+Enter`)

### Option B: Bulk Import via CSV
1. Click on your deck
2. Click **"+ Bulk Add"**
3. Paste this example:
```
Hello,Hola
Goodbye,Adiós
Good morning,Buenos días
Thank you,Gracias
Please,Por favor
```
4. Click **"Import Cards"**

---

## 4. Study Your Cards

1. Click **"Study Now"** on your deck
2. Read the front of the card
3. **Tap the card** to flip it
4. Rate how well you knew it:
   - **1** = Didn't remember
   - **2** = Barely remembered
   - **3** = Remembered with effort
   - **4** = Remembered easily
   - **5** = Knew instantly

The app will automatically schedule when you see each card again based on your rating!

---

## 5. Features to Try

### Spaced Repetition
- Rate cards honestly - the algorithm learns from your ratings
- Cards you struggle with appear more often
- Cards you know well appear less often

### Bulk Delete
- Open a deck
- Click **"Bulk Delete"**
- Select multiple cards with checkboxes
- Click **"Delete Selected"**

### Image Support
Try adding an image URL like:
```
https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/200px-Cat03.jpg
```

---

## 📱 Mobile Testing

The app is mobile-first! To test on mobile:

1. Find your local IP: `ifconfig` or `ipconfig`
2. Access from phone: `http://YOUR-IP:5173`
3. Make sure phone and computer are on same network

Or use browser dev tools:
- Chrome: F12 → Toggle device toolbar
- Firefox: F12 → Responsive design mode

---

## 🎯 Pro Tips

1. **Study Daily**: Come back each day to review due cards
2. **Be Honest**: Rate your recall honestly for best results
3. **Add Images**: Visual learning helps memory retention
4. **Bulk Import**: Prepare CSV files for quick deck creation
5. **Mobile Use**: Add to home screen for app-like experience

---

## 🐛 Troubleshooting

**Cards not showing in study mode?**
- Cards appear immediately when first created
- After rating, they appear again based on your score
- Try rating a card as "1" to see it again soon

**Images not loading?**
- Make sure the URL is publicly accessible
- Use HTTPS URLs when possible
- Try the example URL above to test

**Lost your data?**
- Data is stored in browser localStorage
- Clearing browser data will delete decks
- Use same browser to access your decks

---

## 🏗️ Build for Production

When you're ready to deploy:

```bash
npm run build
```

This creates a `dist/` folder you can deploy to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

---

## 🎉 You're All Set!

The app includes:
- ✅ Full deck and card management
- ✅ Spaced repetition algorithm (SM-2)
- ✅ Beautiful dark theme
- ✅ Mobile-optimized interface
- ✅ Offline-capable (localStorage)
- ✅ Image support
- ✅ Bulk import/delete
- ✅ Progress tracking

Start learning! 📚
