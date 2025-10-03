# FLASHCARD APP DESIGN SYSTEM
## Notion-Inspired with Ocean Breeze Palette

---

### COLOR PALETTE

#### Brand Colors
- Primary Blue: #0077BE
  Usage: Primary buttons, main actions, important highlights
  
- Accent Blue: #48CAE4
  Usage: Secondary highlights, subtle emphasis, hover states

#### Semantic Colors
- Success Green: #51CF66
  Usage: Correct answers, success messages, positive feedback
  
- Warning Orange: #FFA94D
  Usage: Review needed, warnings, attention required
  
- Error Red: #FF6B6B
  Usage: Wrong answers, errors, delete actions

#### Neutral Scale
- Heading Text: #212529 (Dark Gray)
- Body Text: #495057 (Medium Gray)
- Card Background: #E9ECEF (Light Gray)
- Page Background: #F8F9FA (Off White)

#### Color Usage Guidelines
- Brand colors: 10-20% of UI
- Neutrals: 70% of UI (foundation)
- Semantic colors: Status communication only
- Save blue for important moments

---

### TYPOGRAPHY

#### Font Family
- Primary: 'Inter', system-ui, -apple-system, sans-serif
- Fallback: System native fonts

#### Type Scale
- Display Large: 32px, Bold, -0.02em letter-spacing
- Heading 1: 24px, Bold, -0.01em letter-spacing
- Heading 2: 20px, Semibold, normal letter-spacing
- Heading 3: 18px, Semibold, normal letter-spacing
- Body Large: 16px, Regular, 1.6 line-height
- Body Medium: 14px, Regular, 1.5 line-height
- Caption: 12px, Regular, 1.4 line-height

---

### SPACING SCALE

- 4px: Tight spacing (badges, inline elements)
- 8px: Small gaps (between related items)
- 16px: Standard spacing (default gap)
- 24px: Section gaps (between components)
- 32px: Large sections (major layout divisions)

---

### BORDER RADIUS

- 3px: Subtle (badges, small elements)
- 6px: Standard (buttons, inputs)
- 12px: Cards and containers
- 24px: Flashcards (signature rounded look)

---

### ELEVATION & SHADOWS

- None: Flat UI elements
  box-shadow: none

- Low: Hover states, subtle elevation
  box-shadow: 0 1px 2px rgba(0,0,0,0.05)

- Medium: Cards, buttons, interactive elements
  box-shadow: 0 4px 6px rgba(0,0,0,0.07)

- High: Modals, popovers, floating elements
  box-shadow: 0 10px 20px rgba(0,0,0,0.1)

---

### COMPONENT SPECIFICATIONS

#### Buttons
Primary:
  background: #0077BE
  color: white
  padding: 8px 16px
  border-radius: 6px
  font-weight: 500
  font-size: 14px

Secondary:
  background: transparent
  color: #0077BE
  border: 2px solid #0077BE
  padding: 8px 16px
  border-radius: 6px
  font-weight: 500
  font-size: 14px

Ghost:
  background: transparent
  color: inherit
  opacity: 0.6
  hover opacity: 1.0
  padding: 8px 16px
  border-radius: 6px
  font-weight: 500
  font-size: 14px

#### Flashcard States
Default State:
  background: #F8F9FA
  border: 2px solid #E9ECEF
  border-radius: 24px
  padding: 24px
  text-align: center

Question Side (Active):
  background: #0077BE
  color: white
  border-radius: 24px
  padding: 24px
  box-shadow: 0 4px 12px rgba(0,119,190,0.3)
  text-align: center

Answer Side:
  background: #E9ECEF
  border: 2px solid #0077BE
  border-radius: 24px
  padding: 24px
  color: #212529
  text-align: center

#### Input Fields
Default:
  background: #F8F9FA
  border: 1px solid #E9ECEF
  color: #212529
  padding: 12px 16px
  border-radius: 6px
  font-size: 14px

Focused:
  background: #F8F9FA
  border: 2px solid #0077BE
  color: #212529
  padding: 12px 16px
  border-radius: 6px
  font-size: 14px
  outline: none

#### Badges & Tags
Biology Badge:
  background: #0077BE
  color: white
  padding: 4px 12px
  border-radius: 3px
  font-size: 12px
  font-weight: 500

Chemistry Badge:
  background: #48CAE4
  color: #212529
  padding: 4px 12px
  border-radius: 3px
  font-size: 12px
  font-weight: 500

Mastered Badge:
  background: #51CF66
  color: white
  padding: 4px 12px
  border-radius: 3px
  font-size: 12px
  font-weight: 500

Review Badge:
  background: #FFA94D
  color: white
  padding: 4px 12px
  border-radius: 3px
  font-size: 12px
  font-weight: 500

Learning Badge:
  background: #FF6B6B
  color: white
  padding: 4px 12px
  border-radius: 3px
  font-size: 12px
  font-weight: 500

---

### ANIMATION PRINCIPLES

- Duration: 200-300ms for most interactions
- Easing: ease-out (natural deceleration)
- Card Flip: 400ms with 3D rotation
- Hover: 150ms transition
- Focus: Instant (0ms)
- Page transitions: 300ms
- Micro-interactions: Subtle, non-intrusive

---

### LAYOUT GRID

- Max Width: 1200px (centered container)
- Mobile Padding: 24px
- Desktop Padding: 48px
- Column Gap: 24px
- Card Spacing: 16-24px
- Comfortable visual breathing room

---

### ICONOGRAPHY

- Style: Simple, outlined icons
- Size: 20-24px
- Notion-style minimal line icons
- Consistent stroke width
- Use emoji for decorative elements:
  📚 Deck
  🎯 Study
  📊 Stats
  ⚙️ Settings
  ✓ Correct
  + Add

---

### ACCESSIBILITY

- Minimum contrast ratio: 4.5:1 for body text
- Minimum contrast ratio: 3:1 for large text
- Focus indicators: 2px solid #0077BE
- Keyboard navigation: Full support
- Screen reader: Semantic HTML
- Touch targets: Minimum 44x44px

---

### RESPONSIVE BREAKPOINTS

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
- Max container: 1200px

---

Created: 2025-10-03
Version: 1.0
Theme: Ocean Breeze
Inspiration: Notion