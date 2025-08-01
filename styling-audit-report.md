# Visual Styling Audit Report
## Location, Current Operating Conditions, and Design Conditions Blocks

### Overview
This document catalogs the visual styling patterns found in the AssetDetailDrawer component, specifically for the Location, Current Operating Conditions, and Design Conditions blocks. These patterns should be standardized for consistency across the application.

---

## 1. TYPOGRAPHY

### Section Headers
- **Font Size**: `text-lg` (18px)
- **Font Weight**: `font-semibold` (600)
- **Color**: `text-gray-900`
- **Margin Bottom**: `mb-4` (16px)
- **Display**: `flex items-center`
- **Icon**: Positioned with `mr-2` (8px margin-right)

### Field Labels
- **Font Size**: `text-sm` (14px)
- **Font Weight**: `font-medium` (500)
- **Color**: `text-gray-500`
- **Margin Bottom**: `mb-1` (4px)
- **Display**: `block`

### Field Values - Location Block
- **Font Size**: `text-lg` (18px)
- **Font Weight**: `font-medium` (500)
- **Color**: `text-gray-900`

### Field Values - Basic Information Block (for comparison)
- **Font Size**: `text-sm` (14px)
- **Font Weight**: Various (`font-mono` for codes, `font-medium` for standard text)
- **Color**: `text-gray-900`

### Metric Values - Operating/Design Conditions
- **Font Size**: `text-xl` (20px)
- **Font Weight**: `font-bold` (700)
- **Margin Bottom**: `mb-1` (4px)
- **Color**: Contextual (blue-600, green-600, red-600, purple-600, etc.)

### Metric Labels - Operating/Design Conditions
- **Font Size**: `text-sm` (14px)
- **Font Weight**: `font-medium` (500)
- **Color**: `text-gray-600`

---

## 2. SPACING & LAYOUT

### Section Container Spacing
- **Outer Container**: `space-y-6` (24px vertical spacing between sections)
- **Inner Container**: `space-y-4` (16px vertical spacing within sections)

### Grid Behavior
- **Location Block**: Uses vertical stacking (`space-y-4`)
- **Operating Conditions**: `grid grid-cols-1 sm:grid-cols-2 gap-4`
- **Design Conditions**: `grid grid-cols-1 sm:grid-cols-2 gap-4`
- **Basic Information**: `grid grid-cols-1 sm:grid-cols-2 gap-4`

### Card/Metric Card Padding
- **Operating Conditions Cards**: `p-4` (16px all sides)
- **Design Conditions Cards**: `p-4` (16px all sides)
- **Basic Information Fields**: `px-3 py-2` (12px horizontal, 8px vertical)

### Overall Content Padding
- **Main Content Area**: `p-6` (24px all sides)

---

## 3. BACKGROUND COLORS

### Section-Level Backgrounds
- All sections use transparent/default background

### Metric Cards - Operating Conditions
- **Flow Rate**: `bg-blue-50`
- **Pressure**: `bg-green-50`
- **Temperature**: `bg-red-50`
- **Fluid Type**: Dynamic based on fluid type:
  - Water: `bg-blue-50`
  - Oil: `bg-amber-50`
  - Chemical: `bg-purple-50`
  - Steam: `bg-red-50`
  - Air: `bg-gray-50`
  - Gas: `bg-green-50`
  - Other: `bg-gray-50`

### Metric Cards - Design Conditions
- **All Cards**: `bg-purple-50` (consistent purple theme)

### Field Backgrounds - Basic Information
- **Code Fields**: `bg-gray-50` (Serial Number, Model Code)
- **Standard Fields**: No background

---

## 4. BORDERS

### Design Conditions Cards
- **Border**: `border border-purple-200`
- **Border Radius**: `rounded-lg`

### Operating Conditions Cards
- **Border**: None (only background color)
- **Border Radius**: `rounded-lg`

### Basic Information Code Fields
- **Border**: `border` (default gray border)
- **Border Radius**: `rounded`

---

## 5. ICON USAGE

### Section Header Icons
- **Location**: `MapPin` icon, `text-green-600`, `w-5 h-5`, `mr-2`
- **Operating Conditions**: `Gauge` icon, `text-blue-600`, `w-5 h-5`, `mr-2`
- **Design Conditions**: `Settings` icon, `text-purple-600`, `w-5 h-5`, `mr-2`
- **Basic Information**: `Hash` icon, `text-blue-600`, `w-5 h-5`, `mr-2`

### Label Icons (Basic Information)
- **Date Fields**: `Calendar` icon, `w-4 h-4`, `mr-1`

### Badge/Tag Usage
- **Design Conditions**: "Manufacturer Specs" badge
  - Classes: `text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium`
  - Position: `ml-2` from header

---

## 6. RESPONSIVE BEHAVIOR

### Grid Breakpoints
- **Mobile (default)**: `grid-cols-1` - single column layout
- **Small screens and up**: `sm:grid-cols-2` - two column layout
- **Breakpoint**: 640px (sm breakpoint in Tailwind)

### Content Flow
- Location block maintains vertical stacking at all screen sizes
- Operating and Design Conditions use responsive grid (1 col → 2 cols)
- Basic Information uses responsive grid (1 col → 2 cols)

---

## 7. COLOR SCHEMES & THEMES

### Thematic Color Assignment
- **Location**: Green theme (`text-green-600`)
- **Operating Conditions**: Blue theme (`text-blue-600`)
- **Design Conditions**: Purple theme (`text-purple-600`)
- **Basic Information**: Blue theme (`text-blue-600`)

### Metric Value Colors
- **Operating Conditions**: Fixed colors per metric type
  - Flow Rate: `text-blue-600`
  - Pressure: `text-green-600`
  - Temperature: `text-red-600`
  - Fluid Type: Dynamic based on fluid
- **Design Conditions**: Consistent `text-purple-600` for all metrics

---

## 8. STANDARDIZATION RECOMMENDATIONS

### Elements That Should Be Uniform

#### Typography Standards
- **Section headers**: `text-lg font-semibold text-gray-900 mb-4 flex items-center`
- **Field labels**: `text-sm font-medium text-gray-500 mb-1 block`
- **Metric values**: `text-xl font-bold mb-1` + contextual color
- **Metric labels**: `text-sm font-medium text-gray-600`

#### Spacing Standards
- **Section spacing**: `space-y-6` for section containers
- **Field spacing**: `space-y-4` for field containers
- **Card padding**: `p-4` for metric cards
- **Content padding**: `p-6` for main content areas

#### Grid Standards
- **Grid pattern**: `grid grid-cols-1 sm:grid-cols-2 gap-4`
- **Responsive breakpoint**: `sm:` (640px)

#### Icon Standards
- **Section icons**: `w-5 h-5 mr-2` + contextual color
- **Label icons**: `w-4 h-4 mr-1`

#### Card Standards
- **Border radius**: `rounded-lg` for all cards
- **Card layout**: `flex flex-col items-center text-center p-4`

### Inconsistencies to Address

1. **Location vs Other Sections**: Location uses larger text (`text-lg`) for values while others vary
2. **Border Treatment**: Design Conditions has borders, Operating Conditions doesn't
3. **Font Family**: Basic Information uses `font-mono` for some fields, others don't
4. **Value Display**: Location uses simple paragraph, others use centered card layout

### Suggested Uniform Approach

#### Option 1: Card-Based Layout (Recommended)
- Convert Location to use card-based metric display like Operating/Design Conditions
- Use consistent `p-4` padding and `rounded-lg` borders
- Apply thematic background colors (`bg-green-50` for Location)

#### Option 2: List-Based Layout
- Convert Operating/Design Conditions to use simple label-value pairs like Location
- Remove card styling and center alignment
- Use consistent typography hierarchy

---

## 9. COMPONENT PATTERNS FOR REUSE

### Metric Card Component Pattern
```jsx
<div className="flex flex-col items-center text-center p-4 bg-{theme}-50 rounded-lg border border-{theme}-200">
  <div className="text-xl font-bold text-{theme}-600 mb-1">
    {value}
  </div>
  <div className="text-sm font-medium text-gray-600">{label}</div>
</div>
```

### Section Header Pattern
```jsx
<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
  <Icon className="w-5 h-5 mr-2 text-{theme}-600" />
  {title}
</h3>
```

### Field Label Pattern
```jsx
<label className="block text-sm font-medium text-gray-500 mb-1">
  {labelText}
</label>
```
