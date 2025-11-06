# Design System and Component Styling

This document describes the design tokens and common styles used across components.

## Tokens
Design tokens are singular smallest units describing various aspects of design system, like colour, spacing, font size etc.

Tokens ensure that branding and consistency is enforced throughout the application.

**Example of a color token:**

```typescript
export const Color = {
  brand: {
    primary: '#472aff',
    danger: '#dc182c',
    success: '#008556',
    type: '#000000',
    white: '#ffffff',
    gradient: {
      colors: ['#00C9CD', '#472AFF', '#392D9C', '#000000'],
      start: { x: 1, y: 0 }, // approximate 256deg angle
      end: { x: 0, y: 1 },
    },
  },
  ...
}
```

## Component styles

Component styles can combine multiple tokens to create more complex designs. Centralizing component styles in one place ensures ease of maintenance and consistency across the application.

**Example of buttonStyle:**

```typescript
import { Color, BorderRadius, Spacing, Shadow } from '../tokens';

export const buttonStyle = {
	primary: {
		backgroundColor: Color.brand.primary,
		borderRadius: BorderRadius.xs,
		paddingVertical: Spacing.spacing2,
		paddingHorizontal: Spacing.spacing3,
		alignItems: 'center' as const,
		justifyContent: 'center' as const,
		...Shadow.sm,
	},
  ...
}
```

## Theme

Theme groups all the tokens together for an easy import (instead of importing each token one by one). It also ensures scalability for the future if we decide to introduce multiple themes, such as dark mode.


## Quick Start

To use tokens or component styles, simply import them to any screen in the project.

**Example of token and component style usage:**

```typescript
import { Color, buttonStyle } from '@/styles';

// Primary button
<TouchableOpacity style={{ buttonStyles.primary }}>
  <Text style={{ color: Color.brand.wite }}>Primary Button</Text>
</TouchableOpacity>

```

**Example of theme usage:**

```typescript
import { Theme } '@/styles';

<View style={{ padding: Theme.spacing.spacing2 }}>
  <Text style={{ color: Theme.color.brand.white }}>Example Text</Text>
</View>
```
