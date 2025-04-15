# Input Component

This application uses the shadcn/ui Input component for all input elements, providing consistent styling and behavior.

## Usage

The Input component is a simple wrapper around the native HTML input element with consistent styling.

```tsx
import { Input } from "@/components/ui/input"
```

## Examples

### Basic Input

```tsx
<Input type="text" placeholder="Enter your name" />
```

### Form Input with Label

```tsx
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium">
    Email
  </label>
  <Input id="email" type="email" placeholder="name@example.com" required />
</div>
```

### Disabled Input

```tsx
<Input disabled type="text" placeholder="This input is disabled" />
```

### Input with Icon

```tsx
<div className="relative">
  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
  <Input className="pl-8" type="search" placeholder="Search..." />
</div>
```

## Styling

The default Input component comes with the following styling:

- Rounded borders with appropriate padding
- Subtle border and focus states
- Consistent dark mode support
- Disabled states with visual cues

## Custom Styling

You can add custom styles to the Input component using the `className` prop:

```tsx
<Input 
  className="border-blue-500 focus-visible:ring-blue-500" 
  type="text" 
  placeholder="Custom styled input" 
/>
```

## Props

The Input component accepts all standard HTML input props:

| Prop | Type | Description |
|------|------|-------------|
| `type` | string | Input type (text, email, password, etc.) |
| `disabled` | boolean | Whether the input is disabled |
| `required` | boolean | Whether the input is required |
| `placeholder` | string | Placeholder text |
| `className` | string | Additional CSS classes |
| `...props` | any | Any other standard input props |

## Best Practices

- Always use the Input component instead of native HTML inputs for consistent styling
- Provide descriptive labels for accessibility
- Use appropriate input types (email, password, url, etc.)
- Include placeholder text for clarity
- Consider using form validation where appropriate 