# Requirements Document

## Introduction

This document defines the requirements for overhauling the Money Mind personal finance application to be fully responsive across desktop (≥960px), tablet (600px–959px), and mobile (<600px) viewports. The current application uses a permanently visible sidebar, fixed-width layouts, and desktop-centric table components that do not adapt to smaller screens. This overhaul addresses sidebar navigation, transaction table readability, filter controls, AI chat panel sizing, overall layout responsiveness, accessibility, design system consistency, and documentation updates.

## Glossary

- **Layout_Shell**: The top-level layout component (`src/layouts/main.tsx`) that composes the Sidebar, Header, and main content area
- **Sidebar**: The navigation drawer component (`src/layouts/Sidebar.tsx`) containing logo, nav items, logout action, and theme toggle
- **Transaction_Table**: The MUI Table component (`src/features/transactions/components/Table.tsx`) displaying transaction records with 10+ columns
- **Transaction_Controls**: The filter and action controls bar (`src/features/transactions/components/TransactionControls.tsx`) containing search, filter button, dropdowns, and action icons
- **AI_Chat_Panel**: The AI assistant chat interface (`src/features/ai-chat/components/AIChatPanel.tsx`) with message history and input area
- **Mobile_Viewport**: A screen width below the `sm` breakpoint (< 600px)
- **Tablet_Viewport**: A screen width at or above the `sm` breakpoint and below the `md` breakpoint (600px–959px)
- **Desktop_Viewport**: A screen width at or above the `md` breakpoint (≥ 960px)
- **Hamburger_Menu**: A button (typically three horizontal lines icon) that toggles the sidebar visibility on mobile and tablet
- **MUI_Breakpoint_System**: The Material UI responsive breakpoint utilities (`theme.breakpoints.up/down`) used for conditional styling
- **Design_Token**: A named value from the centralized theme (colors, spacing, typography, border-radius) that replaces hardcoded CSS values

## Requirements

### Requirement 1: Responsive Sidebar Navigation

**User Story:** As a mobile user, I want the sidebar to be hidden by default and accessible via a hamburger menu, so that I have more screen space for content while still being able to navigate.

#### Acceptance Criteria

1. WHILE the viewport is a Mobile_Viewport or Tablet_Viewport, THE Sidebar SHALL be hidden by default and render as a temporary (overlay) MUI Drawer with a semi-transparent backdrop scrim covering the remaining viewport
2. WHILE the viewport is a Desktop_Viewport, THE Sidebar SHALL render as a permanent MUI Drawer in either collapsed (100px) or expanded (240px) state
3. WHEN the user taps the Hamburger_Menu button on a Mobile_Viewport or Tablet_Viewport, THE Sidebar SHALL open as a drawer occupying 280px width and 100% of the viewport height, with a slide-in animation completing within 300ms
4. WHEN the user taps the backdrop scrim, taps outside the Sidebar overlay, or selects a navigation item on a Mobile_Viewport or Tablet_Viewport, THE Sidebar SHALL close automatically with a slide-out animation completing within 300ms
5. THE Layout_Shell SHALL render a Hamburger_Menu button in the Header area exclusively on Mobile_Viewport and Tablet_Viewport screens, with an accessible label of "Open navigation menu" for screen readers
6. WHEN the viewport transitions from Mobile_Viewport or Tablet_Viewport to Desktop_Viewport, THE Sidebar SHALL switch from temporary to permanent drawer mode without requiring a page reload, and any open temporary drawer state SHALL be dismissed
7. WHEN the viewport transitions from Desktop_Viewport to Mobile_Viewport or Tablet_Viewport, THE Sidebar SHALL switch from permanent to temporary (hidden) drawer mode, preserving the collapsed/expanded preference for when the user returns to Desktop_Viewport

### Requirement 2: Sidebar Visual Improvements

**User Story:** As a user, I want the sidebar to look polished with a well-integrated logout action and no wasted space, so that the navigation feels professional and consistent.

#### Acceptance Criteria

1. THE Sidebar SHALL render the logout action as a ListItemButton with a Logout icon and text label, using the same component structure (ListItem > ListItemButton > ListItemIcon + ListItemText) and border-radius as the existing navigation items
2. THE Sidebar SHALL apply the theme's error color exclusively to the logout item's icon and text color, with no background fill on the logout item in its default (non-hovered) state
3. THE Sidebar SHALL distribute navigation items, logout action, and theme toggle without vertical gaps exceeding 24px between the navigation list, the logout item, and the theme toggle section
4. THE Sidebar SHALL position the theme toggle immediately after the logout item using the same vertical spacing (8px margin) used between navigation items within the list
5. WHILE the Sidebar is in collapsed state, THE Sidebar SHALL display only icons for all items (navigation, logout, and theme toggle) with a tooltip on hover showing the item's label text (e.g., "Logout" for the logout action)
6. WHEN the user activates the logout action, THE Sidebar SHALL display a confirmation dialog before executing the logout, preserving the existing dialog with cancel and confirm options
7. THE Sidebar SHALL use consistent hover and active state styling across all navigation items: hover state uses `colors.background.purple` (light mode) or `rgba(71, 71, 78, 0.1)` (dark mode), and active state uses `colors.accent.purple` with white text and icons

### Requirement 3: Responsive Transaction Table

**User Story:** As a mobile user, I want to view my transactions in a readable format without awkward horizontal scrolling, so that I can quickly review my financial activity on a small screen.

#### Acceptance Criteria

1. WHILE the viewport is a Mobile_Viewport, THE Transaction_Table SHALL display transactions in a card-based layout showing date, narration, amount, and transaction type per card
2. WHILE the viewport is a Tablet_Viewport, THE Transaction_Table SHALL display transactions in a compact table showing only essential columns (date, narration, category, amount, type) with horizontal scroll for remaining columns
3. WHILE the viewport is a Desktop_Viewport, THE Transaction_Table SHALL display transactions in the existing multi-column table format
4. WHEN a user taps a transaction card on a Mobile_Viewport, THE Transaction_Table SHALL expand the card inline to reveal all remaining fields (notes, category, labels, bank, group) below the summary content
5. WHEN a user taps an already-expanded transaction card on a Mobile_Viewport, THE Transaction_Table SHALL collapse the card back to its summary state showing only date, narration, amount, and transaction type
6. THE Transaction_Table card layout SHALL render each card with a visible border or MUI elevation (minimum elevation of 1) to provide visual separation between entries
7. THE Transaction_Table SHALL color-code the amount text using the theme's success color for credit and the theme's error color for debit in both card and table layouts
8. WHILE the viewport is a Mobile_Viewport, THE Transaction_Table SHALL truncate narration text to a maximum of 2 lines with an ellipsis overflow indicator on the card summary view
9. WHILE the viewport is a Mobile_Viewport, THE Transaction_Table SHALL allow only one card to be expanded at a time, collapsing any previously expanded card when a new card is tapped

### Requirement 4: Responsive Transaction Controls

**User Story:** As a mobile user, I want the transaction filter controls to stack vertically and remain usable on a small screen, so that I can search and filter without elements overlapping or being cut off.

#### Acceptance Criteria

1. WHILE the viewport is a Mobile_Viewport, THE Transaction_Controls SHALL stack controls vertically in the following order: search bar at 100% container width on its own row, then the filter button at 100% width, then the three dropdown selects stacked at 100% width, then action icons in a horizontal group
2. WHILE the viewport is a Mobile_Viewport, THE Transaction_Controls dropdown selects (Transaction Flow, Category, All Transactions) SHALL each render at 100% container width stacked vertically with a minimum height of 44px per control
3. WHILE the viewport is a Tablet_Viewport, THE Transaction_Controls SHALL render the search bar at full width on its own row, with the remaining controls in a wrapping horizontal row below
4. WHILE the viewport is a Desktop_Viewport, THE Transaction_Controls SHALL render all controls in a single horizontal row with flex-wrap behavior
5. THE Transaction_Controls action icons (upload, cash memo, sync) SHALL render in a horizontal row with each icon having a minimum tap target of 44×44px, remaining fully visible without clipping on all viewports
6. WHILE the viewport is a Mobile_Viewport or Tablet_Viewport, WHEN the Filter Drawer is opened, THE Filter Drawer SHALL occupy 100% of the viewport width
7. IF any Transaction_Controls element would exceed the container width on a Mobile_Viewport, THEN THE Transaction_Controls SHALL prevent horizontal overflow by wrapping the element onto a new row rather than clipping or triggering a horizontal scrollbar

### Requirement 5: Responsive AI Chat Panel

**User Story:** As a mobile user, I want the AI chat panel to fill the available screen space and remain usable with the on-screen keyboard visible, so that I can interact with the AI assistant comfortably.

#### Acceptance Criteria

1. WHILE the viewport is a Mobile_Viewport, THE AI_Chat_Panel SHALL occupy the full width of the content area with horizontal padding of 8px on each side
2. THE AI_Chat_Panel message bubbles SHALL have a maximum width of 85% of the container on Mobile_Viewport, 75% on Tablet_Viewport, and 70% on Desktop_Viewport
3. THE AI_Chat_Panel input area SHALL remain pinned to the bottom of the visible viewport and not scroll with the message history
4. WHILE the on-screen keyboard is visible on a Mobile_Viewport, THE AI_Chat_Panel SHALL use the `visualViewport` API (or CSS `dvh` dynamic viewport units as fallback) to reduce its message area height to accommodate the keyboard, keeping the input field fully visible and maintaining a minimum message area height of 120px
5. THE AI_Chat_Panel message history area SHALL be independently scrollable so that the user can scroll through messages without affecting the position of the input area

### Requirement 6: Overall Layout Responsiveness

**User Story:** As a user accessing Money Mind on any device, I want all pages to adapt fluidly to my screen size, so that the application is equally usable on phones, tablets, and desktops.

#### Acceptance Criteria

1. THE Layout_Shell SHALL use the MUI_Breakpoint_System for all responsive behavior rather than hard-coded pixel media queries
2. WHILE the viewport is a Mobile_Viewport or Tablet_Viewport, THE Layout_Shell main content area SHALL occupy 100% of the viewport width (no space reserved for a permanent sidebar)
3. WHILE the viewport is a Mobile_Viewport, THE Layout_Shell SHALL apply 16px horizontal padding to the main content area
4. WHILE the viewport is a Tablet_Viewport, THE Layout_Shell SHALL apply 20px horizontal padding to the main content area
5. WHILE the viewport is a Desktop_Viewport, THE Layout_Shell SHALL apply 24px horizontal padding to the main content area
6. WHILE the viewport is a Mobile_Viewport, THE Header component SHALL truncate heading text with an ellipsis when it exceeds the available width, limiting the heading to a single line to prevent horizontal overflow
7. IF any content area exceeds the viewport width, THEN THE Layout_Shell SHALL prevent a horizontal page-level scrollbar by applying overflow-x hidden on the root container
8. THE Layout_Shell transitions between viewport layouts SHALL use CSS transitions with a duration no longer than 300ms applied to width and padding properties
9. THE Layout_Shell SHALL support viewports from a minimum width of 320px upward without content overlap or truncation of primary interactive elements

### Requirement 7: Accessibility

**User Story:** As a user with assistive technology or limited mobility, I want the application to be fully navigable via keyboard and compatible with screen readers, so that I can use all features without relying on a mouse or touch.

#### Acceptance Criteria

1. THE application SHALL support full keyboard navigation for all interactive elements (navigation items, buttons, form controls, table rows, modals, drawers) using Tab, Shift+Tab, Enter, Escape, and Arrow keys
2. THE application SHALL display a visible focus indicator (minimum 2px outline with sufficient contrast) on all focusable elements when navigated via keyboard
3. THE application SHALL provide appropriate ARIA attributes (aria-label, aria-expanded, aria-controls, aria-hidden, role) on all interactive and dynamic UI components including the Sidebar drawer, hamburger menu, filter drawer, modals, and expandable cards
4. THE application SHALL maintain a minimum color contrast ratio of 4.5:1 for normal text and 3:1 for large text as defined by WCAG 2.1 AA
5. THE application SHALL provide a minimum touch target size of 44×44px for all interactive elements on Mobile_Viewport and Tablet_Viewport
6. WHEN the user has enabled `prefers-reduced-motion` in their operating system settings, THE application SHALL disable or reduce all CSS animations and transitions to simple state changes
7. THE application SHALL use semantic HTML elements (nav, main, header, button, dialog) instead of generic div elements for landmark and interactive regions

### Requirement 8: Design System Consistency

**User Story:** As a developer working on Money Mind, I want all UI components to use centralized design tokens from the theme, so that the application maintains visual consistency and is easy to modify.

#### Acceptance Criteria

1. THE application SHALL NOT use hardcoded color values (hex codes, rgb, rgba) in component-level styling; all colors SHALL reference values from the centralized theme (`colors.ts`) or MUI theme palette via `theme.palette.*`
2. THE application SHALL NOT use hardcoded spacing values in component-level styling; all spacing SHALL use the `unit()` helper from `src/shared/theme/spacing.ts` for CSS string values or `unitless()` for numeric values, based on the 4px baseline grid
3. THE application SHALL NOT use hardcoded font sizes in component-level styling; all typography SHALL reference the MUI theme typography variants or values from the centralized typography scale (`typography.ts`)
4. THE application SHALL NOT use hardcoded border-radius values in component-level styling; all border-radius values SHALL reference the centralized `borderRadius` scale from the theme (e.g., `borderRadius.base`, `borderRadius.md`)
5. THE application SHALL NOT use hardcoded breakpoint pixel values in media queries; all responsive logic SHALL use the MUI_Breakpoint_System (`theme.breakpoints.up`, `theme.breakpoints.down`, or the `sx` prop responsive object syntax)
6. THE application SHALL establish consistent hover state patterns: background color change for navigation items, opacity/elevation change for cards, and color intensity change for buttons — applied uniformly across the app
7. THE application SHALL define all layout-level dimensions (sidebar widths, content padding, header height) as named constants in a centralized `src/shared/constants/layout.ts` file using the `unitless()` helper, so that future modifications require changes in only one location

### Requirement 9: Responsive Modals and Dialogs

**User Story:** As a mobile user, I want modals and dialogs to be usable on small screens without content being cut off or requiring awkward scrolling.

#### Acceptance Criteria

1. WHILE the viewport is a Mobile_Viewport, THE application modals (Add Cash Memo, Edit Transaction, Group Dialog, Label Assignment) SHALL render at 95% viewport width with a maximum width of 500px and auto height with vertical scrolling enabled
2. WHILE the viewport is a Mobile_Viewport, THE modal form fields (amount, date picker, radio buttons in Add Cash Memo) SHALL stack vertically instead of rendering in a horizontal row
3. WHILE the viewport is a Desktop_Viewport, THE modals SHALL render at their current fixed widths centered in the viewport
4. THE modal close/dismiss actions (backdrop click, escape key, close button) SHALL remain functional on all viewports
5. WHEN a modal is open on a Mobile_Viewport, THE modal SHALL prevent background scrolling of the page content beneath it

### Requirement 10: Responsive Pages (Dashboard, Analytics, Budget, Goals, Debts)

**User Story:** As a mobile user, I want all application pages to be usable on my phone, so that I can manage all aspects of my finances without needing a desktop.

#### Acceptance Criteria

1. WHILE the viewport is a Mobile_Viewport, THE Dashboard page charts SHALL render at 100% container width, stacking vertically with appropriate spacing (16px gap) between chart sections
2. WHILE the viewport is a Mobile_Viewport, THE Analytics page charts SHALL render at 100% container width, with legends positioned below the chart instead of beside it
3. WHILE the viewport is a Mobile_Viewport, THE Budget and Goals pages SHALL render card-based content at 100% width in a single-column layout
4. WHILE the viewport is a Desktop_Viewport, THE Dashboard and Analytics pages SHALL render charts in a multi-column grid layout (2 or 3 columns depending on content)
5. THE application chart containers SHALL resize responsively using the Recharts `ResponsiveContainer` component with 100% width
6. WHILE the viewport is a Mobile_Viewport, THE Debts page SHALL render debt entries as vertically-stacked cards with key information (name, amount, status) visible without horizontal scrolling
7. WHILE data is loading on a Mobile_Viewport, THE responsive layouts (cards, stacked controls, single-column grids) SHALL display skeleton placeholders matching the shape of the expected content (skeleton cards for card layouts, skeleton rows for compact tables) rather than a single centered spinner
8. WHILE no data is available on a Mobile_Viewport, THE application pages SHALL render an empty state illustration or message centered within the content area at full width, without layout shift when data eventually loads

### Requirement 11: Steering Documentation Update

**User Story:** As a developer joining the project, I want up-to-date architectural documentation, so that I can build new UI features consistently without additional guidance.

#### Acceptance Criteria

1. WHEN the responsive design overhaul implementation is complete, THE steering documents at `.kiro/steering/` SHALL be updated to reflect the responsive design strategy (mobile-first approach, breakpoint definitions, layout patterns)
2. THE updated steering documentation SHALL include guidelines for: responsive breakpoint usage, sidebar behavior, layout patterns, design token usage, accessibility standards, mobile-first component development
3. THE updated steering documentation SHALL document the spacing scale, color system, typography scale, and border-radius tokens as the single source of truth for styling
4. THE updated steering documentation SHALL include examples of responsive patterns (MUI sx prop responsive syntax, useMediaQuery usage, responsive component patterns) for developer reference
5. THE updated steering documentation SHALL replace any references to the old project (KONE Digital Logbook) with Money Mind-specific context and conventions
