# Button Component

This application uses the shadcn/ui Button component for all button elements, providing consistent styling and behavior.

## Variants

The Button component supports the following variants:

| Variant | Description | Usage |
|---------|-------------|-------|
| `default` | Primary action button | Main actions, form submissions |
| `destructive` | Indicates destructive actions | Delete operations |
| `outline` | Button with an outline | Secondary actions, toggles |
| `secondary` | Alternative styling | Less important actions |
| `ghost` | Button without background | Sidebar actions, menu items |
| `link` | Appears as a link | Navigation-like actions |
| `google` | Custom Google-styled button | Google sign-in |

## Sizes

The Button component supports these sizes:

| Size | Description | Usage |
|------|-------------|-------|
| `default` | Standard size | Most buttons |
| `sm` | Small size | Compact UI areas |
| `lg` | Large size | Call-to-action buttons |
| `icon` | Square button for icons | Mobile toggles, icon-only buttons |

## Props

| Prop | Type | Description |
|------|------|-------------|
| `variant` | string | Button styling variant |
| `size` | string | Button size |
| `asChild` | boolean | Pass button props to child component |
| `loading` | boolean | Shows loading spinner and disables button |

## Examples

### Standard Button

```tsx
<Button variant="default">Click Me</Button>
```

### Button with Loading State

```tsx
<Button variant="default" loading={isLoading}>
  {!isLoading && 'Submit'}
</Button>
```

### Google Sign In Button

```tsx
<Button variant="google" className="w-full">
  <GoogleIcon />
  <span>Sign in with Google</span>
</Button>
```

### Link Button

```tsx
<Button asChild variant="outline">
  <Link href="/login">Login</Link>
</Button>
```

## Notes

- Always use the Button component instead of native HTML buttons for consistent styling
- When using with Next.js Link component, use the `asChild` prop and nest the Link inside the Button
- For icon-only buttons, use the `size="icon"` prop
- Custom colors can be applied using className 