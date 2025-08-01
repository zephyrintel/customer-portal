import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import MaintenanceListTable from '../../../../components/Maintenance/MaintenanceListTable';

// Mock the hooks and components
jest.mock('../../../../src/hooks/useTouch', () => ({
  useDeviceType: () => 'desktop'
}));

jest.mock('../../../../src/components/VirtualList/VirtualList', () => {
  return function MockVirtualList({ items, renderItem }) {
    return (
      <div data-testid="virtual-list">
        {items.map((item, index) => renderItem(item, index))}
      </div>
    );
  };
});

const items = Array.from({ length: 20 }, (_, i) => ({
  id: `${i + 1}`,
  name: `Item ${i + 1}`,
  equipmentType: 'Pump',
  location: 'Facility A',
  priority: 'critical' as const,
  daysOverdue: 5,
  lastMaint: '2021-09-01',
  asset: {
    id: `asset-${i + 1}`,
    serialNumber: `SN-${i + 1}`,
    modelCode: `MODEL-${i + 1}`
  }
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MaintenanceListTable', () => {
  beforeEach(() => {
    // Mock scroll properties for consistent testing
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      get: function() { return this._scrollWidth || 1000; }
    });
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: function() { return this._clientWidth || 200; }
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
      configurable: true,
      get: function() { return this._scrollLeft || 0; },
      set: function(val) { this._scrollLeft = val; }
    });
  });

  test('renders maintenance table with proper structure', () => {
    const { container } = renderWithRouter(
      <MaintenanceListTable items={items} />
    );
    
    expect(container.querySelector('table')).toBeInTheDocument();
    expect(container.querySelector('thead')).toBeInTheDocument();
    expect(container.querySelector('tbody')).toBeInTheDocument();
  });

  test('renders scroll indicators when content is overflowing', () => {
    const { container } = renderWithRouter(
      <div style={{ width: '200px' }}>
        <MaintenanceListTable items={items} />
      </div>
    );

    const scrollContainer = container.querySelector('[class*="overflow-x-auto"]');
    expect(scrollContainer).toBeInTheDocument();
    
    // Mock overflowing content
    Object.defineProperty(scrollContainer, 'scrollWidth', { value: 1000, configurable: true });
    Object.defineProperty(scrollContainer, 'clientWidth', { value: 200, configurable: true });
    Object.defineProperty(scrollContainer, 'scrollLeft', { value: 100, configurable: true });
    
    fireEvent.scroll(scrollContainer);

    // Should show scroll indicators
    expect(container.querySelector('.absolute.left-0')).toBeInTheDocument();
    expect(container.querySelector('.absolute.right-0')).toBeInTheDocument();
  });

  test('renders sticky column header', () => {
    const { container } = renderWithRouter(
      <MaintenanceListTable items={items} />
    );
    
    const stickyHeader = container.querySelector('.sticky.left-0');
    expect(stickyHeader).toBeInTheDocument();
    expect(stickyHeader).toHaveTextContent('Equipment');
  });

  test('renders maintenance items with priority indicators', () => {
    renderWithRouter(<MaintenanceListTable items={items} />);
    
    // Should render priority badges
    const priorityBadges = screen.getAllByText('critical');
    expect(priorityBadges.length).toBeGreaterThan(0);
  });

  test('handles selection when showSelection is enabled', () => {
    const mockToggleSelection = jest.fn();
    
    renderWithRouter(
      <MaintenanceListTable 
        items={items} 
        showSelection={true}
        onToggleSelection={mockToggleSelection}
      />
    );
    
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    
    fireEvent.click(checkboxes[1]); // First item checkbox (after select all)
    expect(mockToggleSelection).toHaveBeenCalled();
  });

  test('matches snapshot for desktop view', () => {
    const { container } = renderWithRouter(
      <MaintenanceListTable items={items.slice(0, 3)} />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });
});

