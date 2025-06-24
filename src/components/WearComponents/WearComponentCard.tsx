import React from 'react';
import { AlertTriangle, Clock, CheckCircle, ShoppingCart } from 'lucide-react';
import { WearComponent } from '../../types/Asset';

interface WearComponentCardProps {
  component: WearComponent;
}

const WearComponentCard: React.FC<WearComponentCardProps> = ({ component }) => {
  const calculateReplacementStatus = () => {
    if (!component.lastReplaced || !component.recommendedReplacementInterval) {
      return { status: 'unknown', daysUntilDue: null, nextDueDate: null };
    }

    const lastReplacedDate = new Date(component.lastReplaced);
    const intervalMonths = parseInt(component.recommendedReplacementInterval.split(' ')[0]);
    const nextDueDate = new Date(lastReplacedDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + intervalMonths);
    
    const today = new Date();
    const daysUntilDue = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let status: 'overdue' | 'due-soon' | 'good' | 'unknown';
    if (daysUntilDue < 0) {
      status = 'overdue';
    } else if (daysUntilDue <= 30) {
      status = 'due-soon';
    } else {
      status = 'good';
    }

    return { status, daysUntilDue, nextDueDate };
  };

  const { status, daysUntilDue, nextDueDate } = calculateReplacementStatus();

  const getStatusIcon = () => {
    switch (status) {
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'due-soon':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'overdue':
        return 'border-red-200 bg-red-50';
      case 'due-soon':
        return 'border-yellow-200 bg-yellow-50';
      case 'good':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusText = () => {
    if (status === 'overdue') {
      return `Overdue by ${Math.abs(daysUntilDue!)} days`;
    } else if (status === 'due-soon') {
      return `Due in ${daysUntilDue} days`;
    } else if (status === 'good') {
      return `Next due: ${nextDueDate?.toLocaleDateString()}`;
    } else {
      return 'Schedule not available';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never replaced';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRequestQuote = () => {
    console.log('Request quote for part:', component.partNumber);
    // TODO: Implement quote request functionality
  };

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              Part #{component.partNumber}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {getStatusText()}
            </p>
          </div>
        </div>
        <button
          onClick={handleRequestQuote}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          aria-label={`Request quote for ${component.partNumber}`}
        >
          <ShoppingCart className="w-3 h-3" />
          <span className="hidden sm:inline">Quote</span>
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <p className="text-sm text-gray-900 font-medium">
            {component.description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Interval:</span>{' '}
            {component.recommendedReplacementInterval || 'Not specified'}
          </div>
          <div>
            <span className="font-medium">Last Replaced:</span>{' '}
            {formatDate(component.lastReplaced)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WearComponentCard;