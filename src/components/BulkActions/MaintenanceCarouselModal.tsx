import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Asset } from '../../types/Asset';
import MaintenanceSchedulingModal from '../Maintenance/MaintenanceSchedulingModal';

interface MaintenanceCarouselModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: Asset[];
  onComplete: (completedCount: number) => void;
  isLoading?: boolean;
}

const MaintenanceCarouselModal: React.FC<MaintenanceCarouselModalProps> = ({
  isOpen,
  onClose,
  selectedAssets,
  onComplete,
  isLoading = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedAssets, setCompletedAssets] = useState<Set<string>>(new Set());
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setCompletedAssets(new Set());
      setShowSchedulingModal(selectedAssets.length === 1);
    }
  }, [isOpen, selectedAssets.length]);

  // Auto-advance to next asset after scheduling
  useEffect(() => {
    if (completedAssets.size > 0 && currentIndex < selectedAssets.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setShowSchedulingModal(true);
      }, 500);
      return () => clearTimeout(timer);
    } else if (completedAssets.size === selectedAssets.length && completedAssets.size > 0) {
      // All assets completed
      const timer = setTimeout(() => {
        onComplete(completedAssets.size);
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [completedAssets, currentIndex, selectedAssets.length, onComplete, onClose]);

  const currentAsset = selectedAssets[currentIndex];
  const isCompleted = currentAsset && completedAssets.has(currentAsset.id);

  const handleScheduleComplete = () => {
    if (currentAsset) {
      setCompletedAssets(prev => new Set([...prev, currentAsset.id]));
      setShowSchedulingModal(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < selectedAssets.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowSchedulingModal(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowSchedulingModal(true);
    }
  };

  const handleSkip = () => {
    if (currentIndex < selectedAssets.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowSchedulingModal(true);
    } else {
      // Last asset, complete the process
      onComplete(completedAssets.size);
      onClose();
    }
  };

  const handleScheduleAsset = () => {
    setShowSchedulingModal(true);
  };

  if (!isOpen || selectedAssets.length === 0) return null;

  // Single asset - show scheduling modal directly
  if (selectedAssets.length === 1) {
    return (
      <MaintenanceSchedulingModal
        isOpen={showSchedulingModal}
        onClose={onClose}
        asset={currentAsset}
        onSchedule={handleScheduleComplete}
      />
    );
  }

  return (
    <>
      {/* Carousel Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Schedule Maintenance - Asset {currentIndex + 1} of {selectedAssets.length}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{completedAssets.size} of {selectedAssets.length} completed</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(completedAssets.size / selectedAssets.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Asset Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{currentAsset?.name}</h4>
                      <p className="text-sm text-gray-600">
                        {currentAsset?.location.facility} - {currentAsset?.location.area}
                      </p>
                    </div>
                  </div>
                  
                  {isCompleted && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Scheduled</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Serial:</span>
                    <span className="ml-2 text-gray-900 font-mono">{currentAsset?.serialNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-900">{currentAsset?.equipmentType}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0 || isLoading}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === selectedAssets.length - 1 || isLoading}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSkip}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {currentIndex === selectedAssets.length - 1 ? 'Finish' : 'Skip'}
                  </button>

                  {!isCompleted && (
                    <button
                      onClick={handleScheduleAsset}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Maintenance
                    </button>
                  )}
                </div>
              </div>

              {/* Asset List Preview */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h5 className="text-sm font-medium text-gray-700 mb-3">All Selected Assets</h5>
                <div className="max-h-32 overflow-y-auto">
                  <div className="space-y-2">
                    {selectedAssets.map((asset, index) => (
                      <div 
                        key={asset.id} 
                        className={`flex items-center justify-between p-2 rounded text-sm transition-colors duration-150 ${
                          index === currentIndex 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'bg-gray-50'
                        }`}
                      >
                        <span className="font-medium text-gray-900">{asset.name}</span>
                        <div className="flex items-center space-x-2">
                          {completedAssets.has(asset.id) && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {index === currentIndex && (
                            <span className="text-xs font-medium text-blue-600">Current</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Asset Scheduling Modal */}
      {showSchedulingModal && currentAsset && (
        <MaintenanceSchedulingModal
          isOpen={showSchedulingModal}
          onClose={() => setShowSchedulingModal(false)}
          asset={currentAsset}
          onSchedule={handleScheduleComplete}
        />
      )}
    </>
  );
};

export default MaintenanceCarouselModal;