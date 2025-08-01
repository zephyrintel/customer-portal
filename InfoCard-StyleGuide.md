# InfoCard Component Style Guide

## Overview
The InfoCard is a standardized component for displaying key-value information in a clean, consistent format across all three sections of the application.

## Design Specifications

### Container Styles
- **Background**: `bg-neutral-50` (neutral 50)
- **Border**: Optional accent ring based on context color prop
- **Border Radius**: `rounded-lg`
- **Padding**: `p-4`
- **Layout**: `flex flex-col items-start` (left-aligned vertical layout)

### Typography Specifications

#### Label
- **Size**: `text-xs`
- **Color**: `text-gray-500`
- **Weight**: `font-medium`
- **Purpose**: Descriptive text for the data being displayed

#### Value
- **Size**: `text-base` or `text-lg` (depending on emphasis needs)
- **Color**: `text-gray-900`
- **Weight**: `font-semibold`
- **Purpose**: The primary data/metric being highlighted

### Optional Elements
- **Icon Slot**: Optional icon positioned at top-left of the card
- **Accent Ring**: Conditional colored border ring based on context color prop

## Layout Implementation

### Responsive Grid
All three sections will render InfoCards using a responsive grid layout:

```css
.info-cards-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
```

### Responsive Behavior
- **Mobile**: Single column layout
- **Tablet**: 2-3 columns depending on screen width
- **Desktop**: Up to 4 columns with automatic wrapping

## Usage Guidelines

### When to Use
- Displaying key metrics or statistics
- Showing summary information
- Presenting data that benefits from visual separation
- Creating scannable information hierarchies

### Consistency Rules
- All cards within a section should maintain consistent sizing
- Use the same label/value pattern across all implementations
- Apply accent colors consistently based on data context
- Maintain uniform spacing and alignment

## Example Structure

```html
<div class="bg-neutral-50 rounded-lg p-4 flex flex-col items-start [optional-accent-ring]">
  <!-- Optional Icon -->
  <div class="icon-slot mb-2">
    <!-- Icon component -->
  </div>
  
  <!-- Label -->
  <span class="text-xs text-gray-500 font-medium">
    Label Text
  </span>
  
  <!-- Value -->
  <span class="text-lg font-semibold text-gray-900">
    Value Text
  </span>
</div>
```

## Agreement
✅ **Confirmed**: All three sections of the application will utilize this InfoCard specification and render them as responsive grids following the above guidelines.
