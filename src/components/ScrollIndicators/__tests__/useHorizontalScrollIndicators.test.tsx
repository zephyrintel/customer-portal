import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useHorizontalScrollIndicators } from '../../../hooks/useHorizontalScrollIndicators';
import HorizontalScrollIndicators from '../HorizontalScrollIndicators';

// Mock component for testing the hook
const TestComponent: React.FC<{ dependencies?: unknown[] }> = ({ dependencies = [] }) => {
  const { scrollContainerRef, showLeftScroll, showRightScroll, handleScroll } = useHorizontalScrollIndicators(dependencies);

  return (
    <div>
      <div data-testid="scroll-state">
        <span data-testid="left-scroll">{showLeftScroll.toString()}</span>
        <span data-testid="right-scroll">{showRightScroll.toString()}</span>
      </div>
      <div className="relative">
        <HorizontalScrollIndicators 
          showLeftScroll={showLeftScroll} 
          showRightScroll={showRightScroll} 
        />
        <div 
          ref={scrollContainerRef}
          data-testid="scroll-container"
          className="overflow-x-auto"
          style={{ width: '200px' }}
          onScroll={handleScroll}
        >
          <div style={{ width: '400px' }}>Wide content that should overflow</div>
        </div>
      </div>
    </div>
  );
};

describe('useHorizontalScrollIndicators', () => {
  beforeEach(() => {
    // Mock getBoundingClientRect and scroll properties
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
      configurable: true,
      get: function() { return this._scrollLeft || 0; },
      set: function(val) { this._scrollLeft = val; }
    });
    
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      get: function() { return this._scrollWidth || 400; },
      set: function(val) { this._scrollWidth = val; }
    });
    
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: function() { return this._clientWidth || 200; },
      set: function(val) { this._clientWidth = val; }
    });
  });

  test('initially shows right scroll indicator when content overflows', () => {
    render(<TestComponent />);
    
    const leftScroll = screen.getByTestId('left-scroll');
    const rightScroll = screen.getByTestId('right-scroll');
    
    // Initially no left scroll (at start), should show right scroll (content overflows)
    expect(leftScroll).toHaveTextContent('false');
    expect(rightScroll).toHaveTextContent('true');
  });

  test('shows left scroll indicator when scrolled from start', () => {
    render(<TestComponent />);
    
    const scrollContainer = screen.getByTestId('scroll-container');
    const leftScroll = screen.getByTestId('left-scroll');
    
    // Simulate scrolling to the right
    Object.defineProperty(scrollContainer, 'scrollLeft', { value: 100, configurable: true });
    fireEvent.scroll(scrollContainer);
    
    expect(leftScroll).toHaveTextContent('true');
  });

  test('hides right scroll indicator when scrolled to end', () => {
    render(<TestComponent />);
    
    const scrollContainer = screen.getByTestId('scroll-container');
    const rightScroll = screen.getByTestId('right-scroll');
    
    // Simulate scrolling to the end (scrollLeft = scrollWidth - clientWidth)
    Object.defineProperty(scrollContainer, 'scrollLeft', { value: 200, configurable: true });
    fireEvent.scroll(scrollContainer);
    
    expect(rightScroll).toHaveTextContent('false');
  });

  test('updates indicators when dependencies change', () => {
    const { rerender } = render(<TestComponent dependencies={['initial']} />);
    
    // Change dependencies
    rerender(<TestComponent dependencies={['changed']} />);
    
    const leftScroll = screen.getByTestId('left-scroll');
    const rightScroll = screen.getByTestId('right-scroll');
    
    // Should still work after dependency change
    expect(leftScroll).toBeInTheDocument();
    expect(rightScroll).toBeInTheDocument();
  });
});

describe('HorizontalScrollIndicators', () => {
  test('renders left scroll indicator when showLeftScroll is true', () => {
    const { container } = render(
      <HorizontalScrollIndicators showLeftScroll={true} showRightScroll={false} />
    );
    
    const leftIndicator = container.querySelector('.absolute.left-0');
    const rightIndicator = container.querySelector('.absolute.right-0');
    
    expect(leftIndicator).toBeInTheDocument();
    expect(rightIndicator).not.toBeInTheDocument();
  });

  test('renders right scroll indicator when showRightScroll is true', () => {
    const { container } = render(
      <HorizontalScrollIndicators showLeftScroll={false} showRightScroll={true} />
    );
    
    const leftIndicator = container.querySelector('.absolute.left-0');
    const rightIndicator = container.querySelector('.absolute.right-0');
    
    expect(leftIndicator).not.toBeInTheDocument();
    expect(rightIndicator).toBeInTheDocument();
  });

  test('renders both indicators when both props are true', () => {
    const { container } = render(
      <HorizontalScrollIndicators showLeftScroll={true} showRightScroll={true} />
    );
    
    const leftIndicator = container.querySelector('.absolute.left-0');
    const rightIndicator = container.querySelector('.absolute.right-0');
    
    expect(leftIndicator).toBeInTheDocument();
    expect(rightIndicator).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(
      <HorizontalScrollIndicators 
        showLeftScroll={true} 
        showRightScroll={false} 
        className="custom-class"
      />
    );
    
    const leftIndicator = container.querySelector('.custom-class');
    expect(leftIndicator).toBeInTheDocument();
  });

  test('applies custom chevron size', () => {
    const { container } = render(
      <HorizontalScrollIndicators 
        showLeftScroll={true} 
        showRightScroll={false} 
        chevronSize="w-6 h-6"
      />
    );
    
    const chevron = container.querySelector('.w-6.h-6');
    expect(chevron).toBeInTheDocument();
  });
});
