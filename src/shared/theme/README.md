# Money Mind Theme System

This directory contains the centralized design system for the Money Mind application, following industry best practices for maintainable and scalable UI development.

## 📁 Structure

```
theme/
├── colors.ts          # Color palette (primary, grayscale, semantic, accent)
├── typography.ts      # Font families, sizes, weights, line heights
├── spacing.ts         # Spacing utilities (4px baseline grid)
├── breakpoints.ts     # Responsive breakpoints and media queries
├── shadows.ts         # Shadow tokens and z-index management
└── index.ts           # Main theme configuration (light & dark)
```

## 🎨 Usage Examples

### Colors

```tsx
import { colors } from '@/shared/theme'

// Use in component styles
const MyComponent = () => (
  <Box sx={{ backgroundColor: colors.primary.blue, color: colors.grayscale.white }}>Hello World</Box>
)

// Use in styled components
const StyledButton = styled(Button)`
  background-color: ${colors.semantic.success};
  &:hover {
    background-color: ${colors.semantic.successLight};
  }
`
```

### Spacing

```tsx
import { unit, spacing, borderRadius } from '@/shared/theme'

// Use unit() for dynamic spacing
<Box sx={{ padding: unit(4), margin: unit(2) }}> {/* 16px padding, 8px margin */}

// Use predefined spacing scale
<Box sx={{ gap: spacing[4], borderRadius: borderRadius.md }}>
```

### Typography

```tsx
import { fontFamily, fontSize, fontWeight } from '@/shared/theme'
;<Typography
  sx={{
    fontFamily: fontFamily.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  }}
>
  Title Text
</Typography>
```

### Responsive Design

```tsx
import { breakpoints } from '@/shared/theme'

// Mobile-first approach
<Box sx={{
  padding: spacing[2], // 8px on mobile
  [breakpoints.up.md]: {
    padding: spacing[4], // 16px on tablets+
  },
  [breakpoints.up.lg]: {
    padding: spacing[6], // 24px on desktops+
  }
}}>
```

### Shadows & Z-Index

```tsx
import { shadows, zIndex } from '@/shared/theme'

<Dialog sx={{ zIndex: zIndex.modal }}>
<Card sx={{ boxShadow: shadows.card }}>
<Tooltip sx={{ zIndex: zIndex.tooltip }}>
```

### Chart Colors

```tsx
import { colors } from '@/shared/theme'

// Use predefined chart color palettes
;<LineChart data={data}>
  <Line
    dataKey='income'
    stroke={colors.chart.income[0]}
  />
  <Line
    dataKey='expense'
    stroke={colors.chart.expense[0]}
  />
</LineChart>
```

## 🎯 Design Principles

### 1. **4px Baseline Grid**

All spacing values are multiples of 4px for visual consistency:

- `unit(1)` = 4px
- `unit(2)` = 8px
- `unit(4)` = 16px
- `unit(8)` = 32px

### 2. **Mobile-First Responsive**

Use `breakpoints.up` for mobile-first approach:

```tsx
{
  fontSize: '14px',        // Mobile (default)
  [breakpoints.up.md]: {
    fontSize: '16px',      // Tablet
  },
  [breakpoints.up.lg]: {
    fontSize: '18px',      // Desktop
  }
}
```

### 3. **Semantic Color Naming**

Instead of generic names like "red" or "green", use semantic names:

- ✅ `colors.semantic.success`
- ✅ `colors.semantic.error`
- ❌ `colors.green`
- ❌ `colors.red`

### 4. **Consistent Typography Scale**

Use predefined font sizes instead of arbitrary values:

- ✅ `fontSize.lg` (18px)
- ❌ `fontSize: '18px'`

### 5. **Centralized Z-Index**

All z-index values are managed in one place to avoid conflicts:

```tsx
// ✅ Centralized
<Modal sx={{ zIndex: zIndex.modal }}>

// ❌ Arbitrary
<Modal sx={{ zIndex: 9999 }}>
```

## 🌗 Theme Modes

The application supports both light and dark modes. Theme switching is handled via `ColorModeContext`:

```tsx
import { ColorModeContext } from '@/shared/contexts/ThemeContext'

const MyComponent = () => {
  const { mode, toggleMode } = useContext(ColorModeContext)

  return <Button onClick={toggleMode}>Toggle {mode === 'light' ? 'Dark' : 'Light'} Mode</Button>
}
```

## 📝 Best Practices

1. **Always use theme values** instead of hardcoded values
2. **Use spacing utilities** (`unit()`, `spacing[]`) for consistent spacing
3. **Use semantic colors** for better maintainability
4. **Follow mobile-first** responsive design
5. **Centralize all z-index** values in `shadows.ts`
6. **Use MUI's `sx` prop** for styling to leverage theme values

## 🔄 Extending the Theme

To add new theme values:

1. Add constants to the appropriate file (e.g., `colors.ts`)
2. Update the theme configuration in `index.ts`
3. Export from `index.ts` for consumption
4. Document usage in this README

## 📚 Reference

Based on best practices from:

- Material-UI Design System
- Tailwind CSS spacing scale
- Digital Logbook frontend architecture
- Industry-standard design tokens
