# Horizontal Scroll Indicators

This package provides reusable components and hooks for adding horizontal scroll indicators with chevron gradient overlays to any scrollable container.

## Components

### `useHorizontalScrollIndicators` Hook

A React hook that manages scroll state for horizontal scrollable containers.

**Usage:**
```typescript
import { useHorizontalScrollIndicators } from '../hooks/useHorizontalScrollIndicators';

const MyComponent = ({ data }) => {
  const { scrollContainerRef, showLeftScroll, showRightScroll } = useHorizontalScrollIndicators([data]);
  
  return (
    <div className="relative">
      <HorizontalScrollIndicators 
        showLeftScroll={showLeftScroll} 
        showRightScroll={showRightScroll} 
      />
      <div ref={scrollContainerRef} className="overflow-x-auto">
        {/* Your scrollable content */}
      </div>
    </div>
  );
};
```

**Parameters:**
- `dependencies` (optional): Array of dependencies that should trigger a recalculation of scroll indicators

**Returns:**
- `scrollContainerRef`: Ref to attach to your scrollable container
- `showLeftScroll`: Boolean indicating if left scroll indicator should be shown
- `showRightScroll`: Boolean indicating if right scroll indicator should be shown
- `handleScroll`: Manual scroll handler function (usually not needed)

### `HorizontalScrollIndicators` Component

A React component that renders chevron gradient overlays for scroll indicators.

**Usage:**
```typescript
import HorizontalScrollIndicators from './ScrollIndicators/HorizontalScrollIndicators';

<div className="relative">
  <HorizontalScrollIndicators 
    showLeftScroll={showLeftScroll} 
    showRightScroll={showRightScroll}
    chevronSize="w-6 h-6"
    gradientWidth="pl-3 pr-9"
  />
  <div className="overflow-x-auto">
    {/* Your scrollable content */}
  </div>
</div>
```

**Props:**
- `showLeftScroll`: Boolean to show/hide left indicator
- `showRightScroll`: Boolean to show/hide right indicator  
- `className` (optional): Additional CSS classes
- `chevronSize` (optional): Tailwind classes for chevron size (default: "w-5 h-5")
- `gradientWidth` (optional): Tailwind classes for gradient padding (default: "pl-2 pr-8")

## Complete Example

```typescript
import React from 'react';
import { useHorizontalScrollIndicators } from '../hooks/useHorizontalScrollIndicators';
import HorizontalScrollIndicators from './ScrollIndicators/HorizontalScrollIndicators';

const DataTable = ({ data }) => {
  const { scrollContainerRef, showLeftScroll, showRightScroll } = useHorizontalScrollIndicators([data]);
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative">
        <HorizontalScrollIndicators 
          showLeftScroll={showLeftScroll} 
          showRightScroll={showRightScroll} 
        />
        
        <div 
          ref={scrollContainerRef} 
          className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300"
        >
          <table className="min-w-full" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                <th className="sticky left-0 bg-gray-50 z-20">Name</th>
                <th>Column 1</th>
                <th>Column 2</th>
                <th>Column 3</th>
                <th>Column 4</th>
                <th>Column 5</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td className="sticky left-0 bg-white z-10">{item.name}</td>
                  <td>{item.col1}</td>
                  <td>{item.col2}</td>
                  <td>{item.col3}</td>
                  <td>{item.col4}</td>
                  <td>{item.col5}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
```

## Features

- **Automatic Detection**: Automatically shows/hides indicators based on scroll position
- **Responsive**: Handles window resize events
- **Performance**: Uses callback optimization to prevent unnecessary re-renders  
- **Customizable**: Configurable chevron sizes and gradient widths
- **Accessible**: Properly positioned and styled for optimal UX
- **Reusable**: Can be used across any horizontally scrollable content

## Styling Notes

- The parent container must have `position: relative` 
- The scrollable container should have `overflow-x-auto`
- Indicators use `pointer-events-none` to not interfere with scrolling
- Z-index values ensure proper layering (z-10 for indicators)
