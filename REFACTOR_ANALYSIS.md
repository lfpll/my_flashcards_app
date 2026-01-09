# Flashcards App - AI Coding Principles Refactor Analysis

> This document analyzes the codebase against the AI coding principles in `.cursor/agent.md` and identifies opportunities for improvement.

---

## 🔴 High Priority

### 1. Replace Dashboard with Minimalist Version

**Current state:** The `Dashboard.tsx` component is bloated (~390 lines) with:
- Complex hero section with excessive gradients and animations
- Hardcoded mock "Recent Activity" data (fake timestamps, fake deck names)
- Hardcoded mock "Achievements" section (not connected to real data)
- Overly decorative UI that doesn't add functional value

**Action:** Replace with a minimalist dashboard using the existing components in `src/components/layout/minimalist/`:
- `StreakIndicator.tsx` - Clean streak display
- `DailyGoalDots.tsx` - Simple progress visualization  
- `DeckSwitcher.tsx` - Functional deck dropdown

**Steps:**
1. Implement `MinimalistDashboard.tsx` (currently empty) using the helper components
2. Replace Dashboard import in `App.tsx` with MinimalistDashboard
3. Delete the old bloated `Dashboard.tsx`

**Why this matters:** Per principle #2 (Architecture), prefer flat, explicit code over unnecessary complexity. The minimalist components are cleaner, more maintainable, and don't contain fake data.

---

### 2. Delete Dead Code Files

These files are not imported or used anywhere in the application:

| File/Folder | Reason |
|-------------|--------|
| `src/types/models.tsx` | Duplicate of `models.ts` using JSDoc instead of TypeScript. Never imported. |
| `src/components/layout/layout.html` | Static HTML prototype file. Not part of React app. |
| `src/styles/` | Empty directory. |
| `src/components/DecksView/DeckList.tsx` | Never imported by App.tsx or any other component. |
| `src/components/DecksView/DeckCard.tsx` | Only imported by `DeckList.tsx` (which is dead code). |
| `src/components/DecksView/CreateDeckModal.tsx` | Only imported by `DeckList.tsx` (dead code). |
| `src/components/study/SessionStats.tsx` | Never imported or used anywhere. |
| `design-system-showcase.html` | Static showcase file at project root. Not part of app. |

**Why this matters:** Dead code creates confusion, increases cognitive load for LLMs trying to understand the codebase, and wastes context window tokens. Per principle #6 (Regenerability), every file should be purposeful.

---

### 3. Consolidate Context Folders

**Current state:** Two separate folders for contexts:
- `src/context/` - Contains FlashcardContext, GamificationContext, ThemeContext, ToastContext
- `src/contexts/` - Contains only AuthContext

**Action:** Merge into single `src/contexts/` folder.

**Why this matters:** Per principle #1 (Structure), the project should have a "consistent, predictable project layout." Having two near-identical folder names violates this and confuses LLMs regenerating or extending code.

---

### 4. Fix File Extension Inconsistencies

**Problem:** Utils use `.tsx` extension but contain no JSX:
- `src/utils/csvParser.tsx` → should be `.ts`
- `src/utils/imageUpload.tsx` → should be `.ts`  
- `src/utils/spacedRepetition.tsx` → should be `.ts`
- `src/hooks/useConfirm.tsx` → should be `.ts` (if no JSX)

**Problem:** Import statement uses `.jsx` extension:

```tsx
// In src/components/study/StudySession.tsx
import { getDueCards, getWorstPerformingCards, updateCardWithRating } from '../../utils/spacedRepetition.jsx';
```

Should be:
```tsx
import { getDueCards, getWorstPerformingCards, updateCardWithRating } from '../../utils/spacedRepetition';
```

**Why this matters:** File extensions should accurately reflect content. This helps LLMs understand what type of code each file contains at a glance.

---

## 🟡 Medium Priority

### 5. Remove Unused Code Within Files

**In `src/App.tsx`:**
```tsx
const { } = useGamification();  // Empty destructure - remove this line
```

**In `src/components/DecksView/DecksView.tsx`:**
```tsx
lastStudied: Math.floor(Math.random() * 24) // Mock data - either implement or remove
```

**Why this matters:** Per principle #5 (Logging and Errors), code should be explicit. Mock data masquerading as real features creates confusion.

---

### 6. Remove Incomplete/Placeholder Code

**In `src/context/GamificationContext.tsx`:**
```tsx
achievements: [], // TODO: Implement achievements
```

Since we're replacing Dashboard with the minimalist version (which doesn't use achievements), we should:
- Remove the `achievements` array from GamificationContext
- Remove the `Achievement` interface from `src/types/models.ts`
- Remove `achievements` from `GamificationStats` interface in `src/types/models.ts`

**Why this matters:** Per principle #2 (Architecture), avoid unnecessary indirection. Placeholder features add complexity without value.

---

### 7. Simplify TopNav Props Type

**In `src/types/components.ts`:**
```typescript
export interface TopNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onCreateDeck?: () => void;  // Never used in TopNav component
}
```

The `onCreateDeck` prop is defined but never used in the actual TopNav component.

---

## 🟢 Lower Priority

### 8. Component Organization Opportunity

The component structure has some minor inconsistencies that could be addressed:

**Current:**
```
components/
├── DecksView/        # PascalCase folder
│   └── DecksView.tsx
├── deck/             # lowercase folder  
│   └── DeckDetail.tsx
```

**Consider:** Consistent folder naming (either all lowercase or all PascalCase). The project mostly uses lowercase, so `DecksView/` could become `decks-view/` or `decksView/`.

---

### 9. Type Definition Cleanup

Some prop interfaces in `src/types/components.ts` use rest spread typing which loses type safety:

```typescript
export interface FormInputProps {
  label: string;
  [key: string]: any;  // Too permissive
}

export interface FormTextareaProps {
  label: string;
  [key: string]: any;  // Too permissive
}
```

Consider defining explicit props instead of using `[key: string]: any`.

---

## ✅ What's Already Good

1. **Clear separation of concerns** - Contexts, components, utils, and types are well-organized
2. **Consistent component patterns** - Components follow similar structures
3. **Type definitions** - Core models in `models.ts` are well-defined
4. **Storage abstraction** - RxDB adapter pattern provides clean data layer
5. **Reusable UI components** - Button, Modal, Toast, etc. are properly abstracted

---

## Summary Checklist

### ✅ Replace Dashboard with Minimalist Version:
- [x] Implement `src/components/layout/minimalist/MinimalistDashboard.tsx` using StreakIndicator, DailyGoalDots, DeckSwitcher
- [x] Update `src/App.tsx` to import MinimalistDashboard instead of Dashboard
- [x] Delete `src/components/layout/Dashboard.tsx` (old bloated version)

### ✅ Delete These Files/Folders:
- [x] `src/types/models.tsx`
- [x] `src/components/layout/layout.html`
- [x] `src/styles/`
- [x] `src/components/DecksView/DeckList.tsx`
- [x] `src/components/DecksView/DeckCard.tsx`
- [x] `src/components/DecksView/CreateDeckModal.tsx`
- [x] `src/components/study/SessionStats.tsx`
- [x] `design-system-showcase.html`

### ✅ Rename These Files:
- [x] `src/utils/csvParser.tsx` → `csvParser.ts`
- [x] `src/utils/imageUpload.tsx` → `imageUpload.ts`
- [x] `src/utils/spacedRepetition.tsx` → `spacedRepetition.ts`

### ✅ Move These Files:
- [x] `src/contexts/AuthContext.tsx` → `src/context/AuthContext.tsx` (then delete `contexts/` folder)

### ✅ Fix These Imports:
- [x] All `.jsx` extensions removed from imports throughout the codebase
- [x] All `contexts/AuthContext` imports updated to `context/AuthContext`

### ✅ Remove/Fix Code:
- [x] `src/App.tsx` - Remove empty `const { } = useGamification();`
- [x] `src/components/DecksView/DecksView.tsx` - Remove mock `lastStudied` data (replaced with real `updatedAt`)
- [x] `src/context/GamificationContext.tsx` - Remove unused `achievements` array
- [x] `src/types/models.ts` - Remove `Achievement` interface and `achievements` from `GamificationStats`

---

## ✅ Refactoring Complete

All changes have been applied and the build passes successfully.

