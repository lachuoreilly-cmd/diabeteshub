
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Auth from '../../components/Auth';
import { db } from '../../services/database';
import { vi } from 'vitest';

// Mock the database
vi.mock('../../services/database', () => ({
  db: {
    login: vi.fn(),
    register: vi.fn(),
    seed: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('Auth component', () => {
  const onLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render login form by default', () => {
    render(
        <BrowserRouter>
            <Auth onLogin={onLogin} />
        </BrowserRouter>
    );
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign In to Portal')).toBeInTheDocument();
    expect(screen.queryByLabelText('Full Legal Name')).not.toBeInTheDocument();
  });

  test('should switch to register form', () => {
    render(
        <BrowserRouter>
            <Auth onLogin={onLogin} />
        </BrowserRouter>
    );
    fireEvent.click(screen.getByText('Create Account'));
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Register Secure Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Legal Name')).toBeInTheDocument();
  });

  test('should successfully log in a user', async () => {
    const user = { id: '1', name: 'Test User', email: 'test@example.com' };
    (db.login as vi.Mock).mockResolvedValue(user);

    render(
        <BrowserRouter>
            <Auth onLogin={onLogin} />
        </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Sign In to Portal'));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith(user);
      expect(mockedNavigate).toHaveBeenCalledWith('/assess');
    });
  });

  test('should show error on failed login', async () => {
    (db.login as vi.Mock).mockRejectedValue(new Error('Invalid credentials'));

    render(
        <BrowserRouter>
            <Auth onLogin={onLogin} />
        </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByText('Sign In to Portal'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('should successfully register a user', async () => {
    const user = { id: '1', name: 'New User', email: 'new@example.com' };
    (db.register as vi.Mock).mockResolvedValue(user);

    render(
        <BrowserRouter>
            <Auth onLogin={onLogin} />
        </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Create Account'));
    fireEvent.change(screen.getByPlaceholderText('Jane Doe'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Register Secure Account'));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith(user);
      expect(mockedNavigate).toHaveBeenCalledWith('/assess');
    });
  });

  test('should show error on failed registration', async () => {
    (db.register as vi.Mock).mockRejectedValue(new Error('Email already exists'));

    render(
        <BrowserRouter>
            <Auth onLogin={onLogin} />
        </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Create Account'));
    fireEvent.change(screen.getByPlaceholderText('Jane Doe'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Register Secure Account'));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  test('should disable button while loading', async () => {
    (db.login as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves

    render(
        <BrowserRouter>
            <Auth onLogin={onLogin} />
        </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Sign In to Portal'));

    await waitFor(() => {
        expect(screen.getByText(/Sign In to Portal/i)).toBeDisabled();
    })
  });
});
