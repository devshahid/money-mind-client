# Implementation Plan: Responsive Design Overhaul

## Overview

This plan transforms the Money Mind client from a desktop-only layout into a fully responsive application. The approach is foundational-first: shared hooks and context are built first, followed by the layout shell, then feature-level component adaptations, then tests, and finally documentation updates. Each task uses the existing MUI v6 + TypeScript stack with vitest and fast-check for testing.

## Tasks

- [x] 1. Create layout constants, responsive hooks, and NavigationContext

  - [x] 1.1 Create `useResponsive` hook

    - Create `src/shared/hooks/useResponsive.ts`
    - Implement `ViewportTier` type (`'mobile' | 'tablet' | 'desktop'`)
    - Use MUI `useMediaQuery` with `theme.breakpoints.down('sm')`, `between('sm', 'md')`, `up('md')`
    - Return `{ tier, isMobile, isTablet, isDesktop, isTouch }`
    - Export from `src/shared/hooks/index.ts` barrel file
    - _Requirements: 6.1_

  - [x] 1.2 Create layout constants file

    - Create `src/shared/constants/layout.ts`
    - Define `LAYOUT` object with all layout dimensions using `unitless()` from spacing.ts
    - Include sidebar widths (expanded: 240, collapsed: 100, mobile: 280)
    - Include responsive padding scale (mobile: 16, tablet: 20, desktop: 24)
    - Include header height and transition config
    - All values derived from 4px baseline grid via `unitless()` — never raw pixel numbers
    - _Requirements: 8.2, 8.5_

  - [x] 1.3 Create `useMobileNav` hook

    - Create `src/shared/hooks/useMobileNav.ts`
    - Manage drawer open/close state with `useState`
    - Auto-dismiss drawer when viewport transitions to desktop using `useResponsive`
    - Return `{ isOpen, open, close, toggle }`
    - _Requirements: 1.4, 1.6_

  - [x] 1.4 Create `useKeyboardHeight` hook

    - Create `src/shared/hooks/useKeyboardHeight.ts`
    - Use `window.visualViewport` API to detect on-screen keyboard height
    - Return `{ keyboardHeight, isKeyboardVisible }` with fallback `{ 0, false }` when API unavailable
    - Add/remove `resize` event listener on `visualViewport` with cleanup
    - _Requirements: 5.4_

  - [x] 1.5 Create `NavigationContext` and `NavigationProvider`
    - Create `src/shared/contexts/NavigationContext.tsx`
    - Define `NavigationState` type: `{ isDrawerOpen, isCollapsed, drawerMode }`
    - Define `NavigationActions`: `{ openDrawer, closeDrawer, toggleCollapse }`
    - `drawerMode` derived from `useResponsive` (`'temporary'` for mobile/tablet, `'permanent'` for desktop)
    - Persist `isCollapsed` preference in `localStorage`
    - Export `useNavigation` consumer hook with descriptive error if used outside provider
    - _Requirements: 1.6, 1.7_

- [x] 2. Refactor Layout Shell and Sidebar

  - [x] 2.1 Refactor `src/layouts/main.tsx` to responsive layout

    - Wrap content in `NavigationProvider`
    - Replace direct `<Sidebar />` with `<ResponsiveSidebar />`
    - Apply responsive horizontal padding using `LAYOUT.padding.*` constants (never raw px): `unit(4)` mobile, `unit(5)` tablet, `unit(6)` desktop
    - Set `width: { xs: '100%', md: 'auto' }` on main content area
    - Apply `overflow-x: hidden` to prevent horizontal scrollbar
    - Add CSS transitions using `LAYOUT.transition.duration` constant (≤ 300ms)
    - Import spacing from `src/shared/theme/spacing` and constants from `src/shared/constants/layout`
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.7, 6.8_

  - [x] 2.2 Create `ResponsiveSidebar` component

    - Create `src/layouts/ResponsiveSidebar.tsx`
    - Render MUI `Drawer variant="temporary"` using `LAYOUT.sidebar.mobileWidth` (280px) when `drawerMode === 'temporary'`
    - Render MUI `Drawer variant="permanent"` using `LAYOUT.sidebar.collapsedWidth` / `LAYOUT.sidebar.expandedWidth` when `drawerMode === 'permanent'`
    - Use `ModalProps={{ keepMounted: true }}` for mobile performance
    - Close drawer on nav item click (mobile/tablet)
    - Apply slide-in/slide-out animation using `LAYOUT.transition.duration`
    - All widths reference `LAYOUT` constants, never hardcoded numbers
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.3 Add Hamburger menu to Header

    - Modify `src/layouts/Header.tsx`
    - Conditionally render hamburger `IconButton` on mobile/tablet using `useResponsive`
    - Add `aria-label="Open navigation menu"` to hamburger button
    - Add `aria-expanded` attribute reflecting drawer open state
    - Add text truncation with ellipsis for heading on mobile (`noWrap`, `textOverflow: 'ellipsis'`)
    - _Requirements: 1.5, 6.6, 7.3_

  - [x] 2.4 Refactor Sidebar visual improvements
    - Refactor logout action to use `ListItem > ListItemButton > ListItemIcon + ListItemText` structure
    - Apply theme error color to logout icon/text with no background fill in default state
    - Consistent hover states: `colors.background.purple` (light) / `rgba(71, 71, 78, 0.1)` (dark)
    - Active state: `colors.accent.purple` background with white text/icons
    - Position theme toggle immediately after logout with 8px spacing
    - Show tooltips on collapsed items
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 3. Checkpoint - Verify layout shell works

  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement responsive Transaction components

  - [x] 4.1 Create `TransactionCard` component for mobile

    - Create `src/features/transactions/components/TransactionCard.tsx`
    - Render summary: formatted date, narration (2-line clamp with ellipsis), amount (color-coded), type indicator
    - Use MUI `Card` with `elevation={1}` for visual separation
    - Implement `Collapse` for expanded details (notes, category, labels, bank, group)
    - Use `'—'` placeholder for missing fields; amount defaults to `₹0.00`
    - Apply theme tokens for colors, spacing, border-radius (no hardcoded values)
    - _Requirements: 3.1, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 4.2 Create `TransactionCardList` component

    - Create `src/features/transactions/components/TransactionCardList.tsx`
    - Maintain `expandedId` state — only one card expanded at a time
    - When a new card is tapped, collapse previously expanded card
    - Render empty state illustration when transaction list is empty
    - Render skeleton card placeholders during loading
    - _Requirements: 3.9, 10.7, 10.8_

  - [x] 4.3 Create `TransactionCompactTable` component for tablet

    - Create `src/features/transactions/components/TransactionCompactTable.tsx`
    - Show only essential columns: date, narration, category, amount, type
    - Enable horizontal scroll for remaining columns
    - _Requirements: 3.2_

  - [x] 4.4 Create `TransactionView` orchestrator component

    - Create `src/features/transactions/components/TransactionView.tsx`
    - Use `useResponsive` to select rendering mode: `mobile` → CardList, `tablet` → CompactTable, `desktop` → full CustomTable
    - Pass through all relevant props to each variant
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 4.5 Make `TransactionControls` responsive
    - Modify `src/features/transactions/components/TransactionControls.tsx`
    - Mobile: stack controls vertically (search 100% → filter 100% → dropdowns 100% → action icons horizontal)
    - Tablet: search full width on own row, remaining controls wrap below
    - Desktop: single horizontal row with flex-wrap
    - Set minimum 44×44px tap targets on action icons
    - Filter drawer: 100% width on mobile/tablet
    - Prevent horizontal overflow by wrapping
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 5. Implement responsive AI Chat Panel

  - [x] 5.1 Make `AIChatPanel` responsive
    - Modify `src/features/ai-chat/components/AIChatPanel.tsx`
    - Apply responsive padding: `px: { xs: 1, sm: 2 }`
    - Set message bubble `maxWidth`: 85% mobile, 75% tablet, 70% desktop
    - Pin input area to bottom with `position: sticky`
    - Integrate `useKeyboardHeight` to adjust message area height when keyboard visible
    - Ensure minimum 120px message area height
    - Make message area independently scrollable
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Implement responsive Modals and Page Layouts

  - [x] 6.1 Make modals responsive

    - Update modal components (Add Cash Memo, Edit Transaction, Group Dialog, Label Assignment)
    - Mobile: 95% viewport width, max 500px, vertical scroll enabled
    - Mobile: form fields stack vertically
    - Desktop: current fixed widths centered
    - Ensure close actions (backdrop, escape, close button) work on all viewports
    - Prevent background scrolling when modal open on mobile
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 6.2 Make Dashboard and Analytics pages responsive

    - Apply responsive grid: `gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }`
    - Charts at 100% width on mobile, stacking vertically with 16px gap
    - Legends below chart on mobile instead of beside
    - Use Recharts `ResponsiveContainer` with 100% width
    - Skeleton placeholders during loading
    - _Requirements: 10.1, 10.2, 10.4, 10.5, 10.7_

  - [x] 6.3 Make Budget, Goals, and Debts pages responsive
    - Budget/Goals: single-column card layout at 100% width on mobile
    - Debts: vertically-stacked cards with key info visible without horizontal scroll
    - Skeleton placeholders matching expected content shape
    - Empty state centered within content area
    - _Requirements: 10.3, 10.6, 10.7, 10.8_

- [x] 7. Checkpoint - Verify feature components work

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Design token enforcement and accessibility

  - [ ] 8.1 Replace hardcoded values with theme tokens

    - Audit and replace hardcoded hex colors with `colors.*` or MUI palette references
    - Replace hardcoded spacing with MUI `theme.spacing()` or `spacing.*` scale
    - Replace hardcoded font sizes with MUI typography variants or `fontSize.*`
    - Replace hardcoded border-radius with `borderRadius.*` scale
    - Replace hardcoded breakpoint pixels with MUI breakpoint system (`sx` responsive syntax)
    - Apply consistent hover patterns: bg change for nav, opacity/elevation for cards, color intensity for buttons
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ] 8.2 Add accessibility attributes and keyboard navigation

    - Add `aria-label`, `aria-expanded`, `aria-controls`, `aria-hidden`, `role` to sidebar drawer, hamburger, filter drawer, modals, expandable cards
    - Add visible focus indicator (min 2px outline) on all focusable elements
    - Support Tab, Shift+Tab, Enter, Escape, Arrow keys navigation
    - Ensure minimum 44×44px touch targets on mobile/tablet
    - Use semantic HTML (`nav`, `main`, `header`, `button`, `dialog`)
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.7_

  - [ ] 8.3 Add `prefers-reduced-motion` support

    - Add global CSS media query `@media (prefers-reduced-motion: reduce)` to disable/reduce animations
    - Apply to sidebar transitions, card expand/collapse, drawer animations, layout transitions
    - _Requirements: 7.6_

  - [ ] 8.4 Ensure WCAG AA color contrast compliance
    - Verify all text/background pairs in light and dark themes meet 4.5:1 (normal) and 3:1 (large text)
    - Adjust any failing pairs in `colors.ts` or theme configuration
    - _Requirements: 7.4_

- [ ] 9. Property-based and unit tests

  - [ ]\* 9.1 Write property test: Transaction card required fields (Property 1)

    - **Property 1: Transaction card summary displays required fields**
    - Generate arbitrary transaction objects with fast-check
    - Assert rendered card summary contains date, narration, amount, type for all inputs
    - **Validates: Requirements 3.1**

  - [ ]\* 9.2 Write property test: Expanded card optional fields (Property 2)

    - **Property 2: Expanded card reveals all non-empty optional fields**
    - Generate transactions with various populated optional fields
    - Assert all non-empty fields appear in expanded section
    - **Validates: Requirements 3.4**

  - [ ]\* 9.3 Write property test: Amount color-coding (Property 3)

    - **Property 3: Amount color-coding matches credit/debit status**
    - Generate arbitrary amounts and isCredit booleans
    - Assert success.main color when credit, error.main when debit
    - **Validates: Requirements 3.7**

  - [ ]\* 9.4 Write property test: Single card expansion (Property 4)

    - **Property 4: Single card expansion invariant**
    - Generate sequences of card tap interactions
    - Assert at most 1 card expanded after each interaction
    - **Validates: Requirements 3.9**

  - [ ]\* 9.5 Write property test: Chat bubble max-width (Property 5)

    - **Property 5: Chat bubble max-width matches viewport tier**
    - Generate arbitrary viewport widths
    - Assert bubble maxWidth equals 85%/75%/70% per tier
    - **Validates: Requirements 5.2**

  - [ ]\* 9.6 Write property test: Minimum message area height (Property 6)

    - **Property 6: Minimum message area height with keyboard**
    - Generate keyboard heights from 0 to viewport−200
    - Assert computed message area ≥ 120px
    - **Validates: Requirements 5.4**

  - [ ]\* 9.7 Write property test: Theme color contrast (Property 7)

    - **Property 7: Theme color contrast meets WCAG AA**
    - Generate all text/background pairs from theme tokens
    - Assert contrast ratio ≥ 4.5:1 (normal) and ≥ 3:1 (large text)
    - **Validates: Requirements 7.4**

  - [ ]\* 9.8 Write property test: Touch target minimum size (Property 8)

    - **Property 8: Touch target minimum size**
    - Generate interactive elements at mobile/tablet viewports
    - Assert clickable area ≥ 44px width and ≥ 44px height
    - **Validates: Requirements 4.5, 7.5**

  - [ ]\* 9.9 Write unit tests for hooks and context

    - Test `useResponsive` returns correct tier at each breakpoint
    - Test `useMobileNav` open/close/toggle and auto-dismiss on desktop
    - Test `useKeyboardHeight` with mocked visualViewport API
    - Test `NavigationContext` provider state management and error on missing provider
    - _Requirements: 1.6, 1.7, 5.4, 6.1_

  - [ ]\* 9.10 Write unit tests for layout and sidebar
    - Test correct padding at 320px, 600px, 960px, 1280px
    - Test drawer variant switching (temporary vs permanent)
    - Test hamburger button rendering conditional on viewport
    - Test ARIA attributes on drawer and hamburger
    - _Requirements: 1.1, 1.2, 1.5, 6.3, 6.4, 6.5, 7.3_

- [ ] 10. Checkpoint - Verify all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Update steering documentation

  - [ ] 11.1 Update `.kiro/steering/` with responsive design guidelines
    - Document mobile-first approach and breakpoint definitions (xs/sm/md/lg/xl)
    - Document sidebar behavior per viewport (temporary vs permanent)
    - Document layout patterns (responsive grid, stacking, flex-wrap)
    - Document design token usage (spacing scale, color system, typography, border-radius)
    - Document accessibility standards (ARIA, keyboard nav, focus indicators, touch targets, reduced motion)
    - Include responsive pattern examples (MUI sx prop syntax, useMediaQuery, useResponsive hook)
    - Replace any references to KONE Digital Logbook with Money Mind context
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All code uses TypeScript with MUI v6 responsive patterns (`sx` prop, `useMediaQuery`)
- Test file location: `src/shared/__tests__/responsive.property.test.ts` for property tests
- Existing fast-check v4.6.0 and vitest v4.1.0 are already in devDependencies

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.4"] },
    { "id": 1, "tasks": ["1.3", "1.5"] },
    { "id": 2, "tasks": ["2.1", "2.3", "2.4"] },
    { "id": 3, "tasks": ["2.2"] },
    { "id": 4, "tasks": ["4.1", "4.3", "5.1", "6.1"] },
    { "id": 5, "tasks": ["4.2", "4.4", "4.5", "6.2", "6.3"] },
    { "id": 6, "tasks": ["8.1", "8.2", "8.3", "8.4"] },
    { "id": 7, "tasks": ["9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "9.7", "9.8", "9.9", "9.10"] },
    { "id": 8, "tasks": ["11.1"] }
  ]
}
```
