import React from 'react';
import { Plus, Calendar } from 'lucide-react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

interface FloatingActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  disabled = false
}) => {
  const { triggerHaptic } = useHapticFeedback();

  const handleClick = () => {
    triggerHaptic('medium');
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-blue-700 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] min-w-[56px]"
      aria-label="Schedule new maintenance"
    >
      <div className="relative">
        <Calendar className="w-6 h-6" />
        <Plus className="w-3 h-3 absolute -top-1 -right-1 bg-blue-600 rounded-full" />
      </div>
    </button>
  );
};

export default FloatingActionButton;