import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from '../../components/layout/Header';

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the logo and navigation links', () => {
    fetch.mockResolvedValueOnce({
      ok: false,
    });

    render(<Header />);
    
    expect(screen.getByText('Conference Manager')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Conferences')).toBeInTheDocument();
  });

  it('shows Sign In and Get Started when user is not authenticated', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
    });

    render(<Header />);
    
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });
  });

  it('shows Dashboard and Logout when user is authenticated', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ username: 'testuser', email: 'test@example.com' }),
    });

    render(<Header />);
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('toggles mobile menu when hamburger is clicked', () => {
    fetch.mockResolvedValueOnce({
      ok: false,
    });

    render(<Header />);
    
    const menuToggle = screen.getByLabelText('Toggle menu');
    fireEvent.click(menuToggle);
    
    // Check if hamburger has active class
    const hamburger = menuToggle.querySelector('.hamburger');
    expect(hamburger.classList.contains('active')).toBe(true);
  });
});