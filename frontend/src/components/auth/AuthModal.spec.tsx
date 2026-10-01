import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthModal } from './AuthModal';
import { AuthProvider } from '../../context/AuthContext';
import { apiClient } from '../../lib/api-client';

jest.mock('../../lib/api-client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/movies/123',
}));

describe('AuthModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AuthProvider>
        <AuthModal isOpen={false} onClose={jest.fn()} />
      </AuthProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders sign in modal with email and password inputs when isOpen is true', () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={jest.fn()} />
      </AuthProvider>,
    );

    expect(screen.getByText('Sign in to CineMatch')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('moviebuff@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('switches to create account tab and shows name input', () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={jest.fn()} />
      </AuthProvider>,
    );

    const createAccountTab = screen.getByRole('tab', { name: /create account/i });
    fireEvent.click(createAccountTab);

    expect(screen.getByPlaceholderText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('submits login successfully and triggers onSuccess callback with redirectTo=false', async () => {
    const mockUser = {
      id: 'u-1',
      name: 'Test User',
      email: 'buff@example.com',
      role: 'user',
    };

    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      user: mockUser,
    });

    const mockOnSuccess = jest.fn();
    const mockOnClose = jest.fn();

    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </AuthProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText('moviebuff@example.com'), {
      target: { value: 'buff@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByTestId('auth-submit-btn'));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'buff@example.com',
        password: 'password123',
      });
      expect(mockOnSuccess).toHaveBeenCalledWith(mockUser);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
