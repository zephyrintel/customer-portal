import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import InfoCard from '../../../components/Common/InfoCard';

// Test creating an InfoCard

describe('InfoCard Component', () => {
  it('renders correctly with required props', () => {
    const { getByText } = render(
      <InfoCard label="Test Label" value="Test Value" />
    );
    expect(getByText('Test Label')).toBeInTheDocument();
    expect(getByText('Test Value')).toBeInTheDocument();
  });

  it('applies accent color classes', () => {
    const { container } = render(
      <InfoCard 
        label="Test Label" 
        value="Test Value" 
        accentColorClass="ring-red-500"
      />
    );
    expect(container.firstChild).toHaveClass('ring-red-500');
  });

  it('renders icon when provided', () => {
    const TestIcon = () => <span>Icon</span>;
    const { getByText } = render(
      <InfoCard 
        label="Label" 
        value="Value" 
        icon={<TestIcon />}
      />
    );
    expect(getByText('Icon')).toBeInTheDocument();
  });
});

