import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConferenceCard from '../../components/common/ConferenceCard';

const mockConference = {
  id: 1,
  title: 'Test Conference 2025',
  slug: 'test-conference-2025',
  description: 'This is a test conference description that is quite long and should be truncated in the card display.',
  location: 'New York, USA',
  start_date: '2025-06-01',
  end_date: '2025-06-03',
  status: 'Active',
};

describe('ConferenceCard Component', () => {
  it('renders conference information correctly', () => {
    render(<ConferenceCard conference={mockConference} />);
    
    expect(screen.getByText('Test Conference 2025')).toBeInTheDocument();
    expect(screen.getByText('New York, USA')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('truncates long descriptions', () => {
    render(<ConferenceCard conference={mockConference} />);
    
    const description = screen.getByText(/This is a test conference/);
    expect(description.textContent).toContain('...');
  });

  it('displays dates in correct format', () => {
    render(<ConferenceCard conference={mockConference} />);
    
    // Check if date is rendered (format may vary)
    expect(screen.getByText(/Jun/)).toBeInTheDocument();
  });

  it('contains a link to conference details', () => {
    render(<ConferenceCard conference={mockConference} />);
    
    const link = screen.getByText('View Details →');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/c/test-conference-2025');
  });
});