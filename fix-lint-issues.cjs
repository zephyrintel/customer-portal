const fs = require('fs');
const path = require('path');

// Files and their unused imports to remove
const fixMap = {
  'src/components/Auth/UserProfile.tsx': ['User'],
  'src/components/Calendar/CalendarEventModal.tsx': ['onEdit', 'onReschedule'],
  'src/components/Calendar/MaintenanceCalendar.tsx': ['Plus', 'Filter'],
  'src/components/Dashboard/AssetStatusCard.tsx': ['Activity', 'Eye', 'StatusIndicator'],
  'src/components/Dashboard/MaintenanceSchedulingCard.tsx': ['Calendar'],
  'src/components/Dashboard/PartsEngagementCard.tsx': ['Package', 'Eye', 'StatusIndicator'],
  'src/components/Dashboard/StatusIndicator.tsx': ['Icon', 'detail'],
  'src/components/Documentation/DocumentItem.tsx': ['AlertCircle'],
  'src/components/Documentation/DocumentationManager.tsx': ['AlertCircle', 'DocumentItem'],
  'src/components/Documentation/TechnicalBulletinCard.tsx': ['Eye'],
  'src/components/Layout/MobileNavigation.tsx': ['isCollapsed'],
  'src/components/Layout/Sidebar.tsx': ['Calendar'],
  'src/components/Maintenance/AssetDetailDrawer.tsx': ['User', 'AlertCircle'],
  'src/components/Maintenance/MaintenanceSchedulingModal.tsx': ['Calendar', 'User'],
  'src/components/Notifications/NotificationsPage.tsx': ['BarChart3', 'Mail', 'MessageSquare', 'CheckCircle', 'XCircle', 'Play', 'Pause', 'Edit', 'Trash2', 'Filter'],
  'src/components/Orders/OrderDetailModal.tsx': ['Link'],
  'src/components/Orders/OrdersSection.tsx': ['DollarSign', 'X'],
  'src/hooks/useAssetSelection.ts': ['Asset'],
  'src/hooks/useVirtualList.ts': ['useEffect', 'VirtualListItem'],
  'src/pages/DashboardPage.tsx': ['setIsLoading'],
  'src/pages/DocumentationPage.tsx': ['Filter', 'AlertTriangle', 'Settings', 'Plus', 'Calendar', 'User', 'Download', 'Eye', 'Asset'],
  'src/pages/MaintenancePageV2.tsx': ['Filter', 'MoreHorizontal', 'RefreshCw', 'getAssetMaintenanceStatus', 'MaintenanceItem', 'navigate', 'stats'],
  'src/pages/PartsOrderPage.tsx': ['DollarSign', 'Filter'],
  'src/utils/maintenanceUtils.ts': ['daysBetween']
};

function removeUnusedImports(filePath, unusedItems) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  unusedItems.forEach(item => {
    // Handle different import patterns
    const patterns = [
      // Named imports: import { X, Y, Z } from '...'
      new RegExp(`(import\\s*{[^}]*?)\\b${item}\\b\\s*,?\\s*([^}]*}\\s*from)`, 'g'),
      // Clean up trailing commas in imports
      new RegExp(`(import\\s*{[^}]*),\\s*(}\\s*from)`, 'g'),
      // Clean up leading commas in imports
      new RegExp(`(import\\s*{)\\s*,\\s*([^}]*}\\s*from)`, 'g'),
      // Variable assignments that are unused
      new RegExp(`^\\s*const\\s*\\[\\s*\\w+\\s*,\\s*${item}\\s*\\].*$`, 'gm'),
      // Props that are unused
      new RegExp(`^\\s*${item}\\s*[,:].*$`, 'gm')
    ];
    
    patterns.forEach(pattern => {
      const newContent = content.replace(pattern, (match, g1, g2) => {
        if (match.includes('import')) {
          // For import statements, preserve the structure
          const cleaned = match.replace(new RegExp(`\\b${item}\\b\\s*,?\\s*`, 'g'), '');
          // Clean up any double commas or trailing/leading commas
          return cleaned.replace(/,\s*,/g, ',').replace(/{\s*,/g, '{').replace(/,\s*}/g, '}');
        }
        return match; // Don't modify non-import statements for now
      });
      
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
  });
  
  // Clean up empty imports
  content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"]\s*;?\s*\n/g, '');
  
  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`⏭️  Skipped: ${filePath} (no changes needed)`);
  }
}

console.log('🔧 Fixing linting issues...\n');

Object.entries(fixMap).forEach(([file, items]) => {
  removeUnusedImports(file, items);
});

console.log('\n✨ Done! Run "npm run lint" to see remaining issues.');
