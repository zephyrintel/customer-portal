import React, { useState, useMemo } from 'react';
import { Search, Download, Package, AlertCircle } from 'lucide-react';
import { BillOfMaterialsItem } from '../../types/Asset';

interface BOMTableProps {
  items: BillOfMaterialsItem[];
}

const BOMTable: React.FC<BOMTableProps> = ({ items }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showWearItemsOnly, setShowWearItemsOnly] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = showWearItemsOnly ? item.isWearItem : true;
      
      return matchesSearch && matchesFilter;
    });
  }, [items, searchTerm, showWearItemsOnly]);

  const handleExportCSV = () => {
    const csvContent = [
      ['Part Number', 'Description', 'Quantity', 'Wear Item'],
      ...filteredItems.map(item => [
        item.partNumber,
        item.description,
        item.quantity.toString(),
        item.isWearItem ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bill-of-materials.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            Bill of Materials
          </h2>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No bill of materials available for this asset.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            Bill of Materials
          </h2>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showWearItemsOnly}
                onChange={(e) => setShowWearItemsOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Wear items only</span>
            </label>
            
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Part Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item, index) => (
              <tr key={`${item.partNumber}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-900">
                    {item.partNumber}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {item.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {item.quantity}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.isWearItem ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Wear Item
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Standard
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            {searchTerm || showWearItemsOnly 
              ? 'No items match your search criteria' 
              : 'No items found'
            }
          </p>
        </div>
      )}
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {filteredItems.length} of {items.length} items
          {showWearItemsOnly && ' (wear items only)'}
        </p>
      </div>
    </div>
  );
};

export default BOMTable;