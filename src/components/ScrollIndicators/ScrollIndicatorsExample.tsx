import React from 'react';
import { HorizontalScrollIndicators, useHorizontalScrollIndicators } from './index';

/**
 * Example component demonstrating the usage of horizontal scroll indicators
 * This can be used as a reference for implementing scroll indicators in other components
 */
const ScrollIndicatorsExample: React.FC = () => {
  // Sample data that would cause horizontal overflow
  const sampleData = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * 1000),
    status: ['Active', 'Inactive', 'Pending'][Math.floor(Math.random() * 3)],
    category: ['Category A', 'Category B', 'Category C'][Math.floor(Math.random() * 3)]
  }));

  // Use the hook to manage scroll state
  const { scrollContainerRef, showLeftScroll, showRightScroll } = useHorizontalScrollIndicators([sampleData]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Horizontal Scroll Indicators Example
      </h2>
      
      <p className="text-gray-600 mb-6">
        This table demonstrates the horizontal scroll indicators. Try scrolling horizontally 
        to see the chevron indicators appear and disappear based on scroll position.
      </p>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Sample Data Table</h3>
          <p className="text-sm text-gray-600 mt-1">
            Scroll horizontally to see the indicators in action
          </p>
        </div>
        
        <div className="relative">
          {/* Horizontal scroll indicators */}
          <HorizontalScrollIndicators 
            showLeftScroll={showLeftScroll} 
            showRightScroll={showRightScroll} 
          />
          
          {/* Scrollable content */}
          <div 
            ref={scrollContainerRef} 
            className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '800px' }}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 bg-gray-50 z-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Extra Column 1
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Extra Column 2
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Extra Column 3
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sampleData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="sticky left-0 bg-white z-10 px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'Active' 
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'Inactive'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Extra Data
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      More Data
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Additional Info
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Usage code example */}
      <div className="mt-8 bg-gray-900 rounded-lg p-6 text-white">
        <h4 className="text-lg font-semibold mb-4">Usage Code:</h4>
        <pre className="text-sm overflow-x-auto">
          <code>{`import { HorizontalScrollIndicators, useHorizontalScrollIndicators } from './ScrollIndicators';

const MyComponent = ({ data }) => {
  const { scrollContainerRef, showLeftScroll, showRightScroll } = 
    useHorizontalScrollIndicators([data]);
  
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
};`}</code>
        </pre>
      </div>
    </div>
  );
};

export default ScrollIndicatorsExample;
