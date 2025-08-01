# MaintenanceListTable Component Specification  

## Props  
The `MaintenanceListTable` component will have the following props, mirroring the `AssetsTable` component:  

### Required Props:  
- **items**: `MaintenanceItem[]`  
  - List of maintenance records to display.
- **onToggleSelection**: `(id: string, shiftKey: boolean) => void`  
  - Callback when a row is selected/deselected.

### Optional Props:  
- **selectedIds**: `Set<string>`  
  - Set of currently selected item IDs.
- **onSelectAll**: `() => void`  
  - Callback to select all items.
- **onClearSelection**: `() => void`  
  - Callback to clear selection.
- **isAllSelected**: `boolean`  
  - Boolean indicating if all items are selected.
- **isIndeterminate**: `boolean`  
  - Boolean indicating if the selection is indeterminate.
- **showSelection**: `boolean`  
  - Boolean to toggle selection checkboxes.

## Column Schema  
The table will display the following columns, with a sticky first column and an optional selection column:  
- **Equipment** (sticky, optional selection)
- **Location**  
- **Priority**  
- **Status**  
- **Last Maint**  
- **Days Overdue**  
- **Next Due Date**  

## Breakpoint Behavior  
- **Mobile**: Card view for individual items for better interaction on smaller screens.
- **Tablet**: Sticky table with touch-optimized selection and interaction.
- **Desktop**: Full table view with all columns and rich interaction support.

## Scroll Indicator Overlay Logic  
Overlay scroll indicators should be shown based on the following:  
- **Show left indicator**: when the user can scroll left.
- **Show right indicator**: when the user can scroll right.
- This logic reuses the same pattern as `AssetsTable`.

## Utility Functions  
Re-use existing icon, badge, and date utilities from the codebase:  
- **Icons**: `getEquipmentTypeIcon`
- **Badges**: `getStatusBadge`, `getCriticalityBadge`
- **Date Formats**: `formatDate`

## MaintenanceListTable Stories
New stories for the `MaintenanceListTable` component include examples for desktop and mobile views, the specific use cases for different props, and interactions showcasing priority and location filtering.

## Outcome
This specification establishes a consistent interface contract for implementing the `MaintenanceListTable` component, ensuring usability across different devices and reusing existing utilities for efficiency and maintainability.
