# Card Component Refactoring Example

## Concept: Self-Contained Card Component

Instead of having separate `CardListItem` (display) and `InlineCardEditor` (edit) components managed by the parent, we create a single `Card` component that manages its own state.

## Example Structure

```tsx
/**
 * Card Component - Self-contained card with edit/display modes
 */
export default function Card({
  deckId,
  card, // null for new cards
  showBack = false,
  onSaved, // callback after successful save
  onDeleted // callback after deletion
}) {
  // INTERNAL STATE - card manages itself!
  const [isEditing, setIsEditing] = useState(!card); // auto-edit if new card

  // Edit mode state
  const [front, setFront] = useState(card?.front || '');
  const [back, setBack] = useState(card?.back || '');
  const [frontImageUrl, setFrontImageUrl] = useState(card?.frontImageUrl || '');
  const [backImageUrl, setBackImageUrl] = useState(card?.backImageUrl || '');

  const { addCard, modifyCard, removeCard } = useFlashcards();
  const { showToast } = useToast();

  const isNewCard = !card;

  // SAVE HANDLER
  const handleSave = () => {
    const hasFrontContent = front.trim() || frontImageUrl.trim();
    const hasBackContent = back.trim() || backImageUrl.trim();

    if (!hasFrontContent || !hasBackContent) {
      showToast('Both front and back required', 'error');
      return;
    }

    const cardData = {
      front: front.trim() || '',
      back: back.trim() || '',
      frontImageUrl: frontImageUrl.trim() || null,
      backImageUrl: backImageUrl.trim() || null,
    };

    if (isNewCard) {
      addCard(deckId, cardData);
      showToast('Card added!', 'success');
    } else {
      modifyCard(deckId, card.id, cardData);
      showToast('Card updated!', 'success');
    }

    setIsEditing(false);
    onSaved?.();
  };

  // DELETE HANDLER
  const handleDelete = () => {
    if (isNewCard) {
      // Just remove from UI
      onDeleted?.();
    } else {
      removeCard(deckId, card.id);
      showToast('Card deleted!', 'success');
      onDeleted?.();
    }
  };

  // TOGGLE EDIT MODE
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (isNewCard) {
      // Cancel new card = delete it
      onDeleted?.();
    } else {
      // Cancel edit = restore original values
      setFront(card.front || '');
      setBack(card.back || '');
      setFrontImageUrl(card.frontImageUrl || '');
      setBackImageUrl(card.backImageUrl || '');
      setIsEditing(false);
    }
  };

  // RENDER EDIT MODE
  if (isEditing) {
    return (
      <div className="bg-theme-lighter p-4 rounded-lg border-2 border-accent-primary">
        {/* Same layout as InlineCardEditor */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4">
          {/* Front input */}
          <CardSideInput
            label="Front"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            // ... all the InlineCardEditor logic
          />

          {/* Back input */}
          <CardSideInput
            label="Back"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            // ... all the InlineCardEditor logic
          />

          {/* Save/Cancel buttons */}
          <div className="flex gap-2">
            <button onClick={handleSave}>✓</button>
            <button onClick={handleCancel}>✕</button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER DISPLAY MODE
  return (
    <div className="relative py-4 px-4 bg-theme-card hover:bg-theme-lighter group cursor-pointer" onClick={handleEdit}>
      {/* Status bar */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-4/5 bg-success rounded-full" />

      {/* Delete button */}
      <button onClick={(e) => { e.stopPropagation(); handleDelete(); }}>🗑️</button>

      {/* Card content - same as CardListItem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="text-xs font-medium uppercase">Front</div>
          <div>{card.front}</div>
        </div>
        <div className={showBack ? 'opacity-100' : 'opacity-50'}>
          <div className="text-xs font-medium uppercase">Back</div>
          <div>{showBack ? card.back : '••••••'}</div>
        </div>
      </div>
    </div>
  );
}
```

## Usage in DeckDetail (MUCH SIMPLER!)

```tsx
export default function DeckDetail({ deckId, onBack, onStudy }) {
  const { decks } = useFlashcards();
  const [showAllBacks, setShowAllBacks] = useState(false);

  // Simple array of temporary new card IDs
  const [newCardIds, setNewCardIds] = useState([]);

  const deck = decks.find(d => d.id === deckId);

  const addNewCard = () => {
    // Just add a temporary ID to trigger rendering a new Card
    setNewCardIds(prev => [...prev, `temp-${Date.now()}`]);
  };

  const removeNewCard = (tempId) => {
    setNewCardIds(prev => prev.filter(id => id !== tempId));
  };

  return (
    <div>
      <button onClick={addNewCard}>+ Add Card</button>****

      {/* New cards (with card=null) */}
      {newCardIds.map(tempId => (
        <Card
          key={tempId}
          deckId={deck.id}
          card={null} // null = new card
          onSaved={() => removeNewCard(tempId)} // remove temp ID after save
          onDeleted={() => removeNewCard(tempId)} // remove temp ID on cancel
        />
      ))}

      {/* Existing cards */}
      {deck.cards.map(card => (
        <Card
          key={card.id}
          deckId={deck.id}
          card={card}
          showBack={showAllBacks}
        />
      ))}
    </div>
  );
}
```

## Key Benefits

### Before (Current):
- DeckDetail manages: `editingCardId`, `newCardEditors[]`
- DeckDetail has: `handleEditCard()`, `addNewCard()`, `removeNewCardEditor()`
- DeckDetail conditionally renders `<InlineCardEditor>` OR `<CardListItem>`
- Only ONE card can be edited at a time
- Complex state management with multiple arrays/IDs

### After (Proposed):
- DeckDetail only manages: `newCardIds[]` (temporary IDs)
- DeckDetail has: `addNewCard()`, `removeNewCard()` - simple array operations
- Each Card manages its OWN editing state
- MULTIPLE cards can be edited simultaneously
- Simple, clean parent component

## Multiple Simultaneous Edits Example

```tsx
// User can now do this:
1. Click "Add Card" → New card 1 appears in edit mode
2. Click "Add Card" again → New card 2 appears in edit mode
3. Click existing card → That card enters edit mode
4. Now 3 cards are in edit mode simultaneously!
5. User can save/cancel each independently
```

This was IMPOSSIBLE before because `editingCardId` was a single value.

## Implementation Steps

1. Create new `Card.tsx` component combining CardListItem + InlineCardEditor logic
2. Update DeckDetail to use simplified state management
3. Remove `editingCardId` state
4. Simplify `newCardEditors` to just `newCardIds`
5. Test multiple simultaneous edits

Would you like me to implement this?
