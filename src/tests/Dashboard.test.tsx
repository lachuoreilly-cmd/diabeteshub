
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../components/Dashboard';
import { User, Profile } from '../../types';
import * as geminiService from '../../services/geminiService';
import { vi } from 'vitest';

// Mock geminiService
vi.mock('../../services/geminiService', () => ({
  analyzeMeal: vi.fn(),
}));

const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  profiles: [
    {
      id: 'default',
      name: 'Test User',
      relationship: 'Self',
      history: [],
      glucoseLogs: [],
      mealLogs: [],
      exerciseLogs: [],
      myExercisePlans: [],
      exerciseSessions: [],
      savedRecipes: [],
      hba1cHistory: [],
      currentMedications: []
    }
  ],
  activeProfileId: 'default',
};

const mockProfile: Profile = mockUser.profiles[0];

describe('Dashboard component', () => {
  const onUpdateUser = vi.fn();
  const onUpdateProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders dashboard with user data', () => {
    render(
      <BrowserRouter>
        <Dashboard user={mockUser} activeProfile={mockProfile} onUpdateUser={onUpdateUser} onUpdateProfile={onUpdateProfile} />
      </BrowserRouter>
    );

    expect(screen.getByText('Health Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('logs glucose reading', () => {
    render(
      <BrowserRouter>
        <Dashboard user={mockUser} activeProfile={mockProfile} onUpdateUser={onUpdateUser} onUpdateProfile={onUpdateProfile} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Value'), { target: { value: '120' } });
    fireEvent.click(screen.getByText('Log Reading'));

    expect(onUpdateProfile).toHaveBeenCalledWith(expect.objectContaining({
      glucoseLogs: expect.any(Array),
    }));
  });

  test('analyzes meal', async () => {
    (geminiService.analyzeMeal as vi.Mock).mockResolvedValue({ calories: 300, carbs: 50, protein: 20, fat: 10, glycemicImpact: 'Low', suggestions: 'Good meal' });

    render(
      <BrowserRouter>
        <Dashboard user={mockUser} activeProfile={mockProfile} onUpdateUser={onUpdateUser} onUpdateProfile={onUpdateProfile} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Describe your meal/i), { target: { value: 'Salad' } });
    fireEvent.click(screen.getByText('Log & Process Meal'));

    await waitFor(() => {
      expect(geminiService.analyzeMeal).toHaveBeenCalledWith('Salad', undefined);
      expect(onUpdateProfile).toHaveBeenCalledWith(expect.objectContaining({
        mealLogs: expect.any(Array),
      }));
    });
  });

  test('logs exercise', () => {
    render(
      <BrowserRouter>
        <Dashboard user={mockUser} activeProfile={mockProfile} onUpdateUser={onUpdateUser} onUpdateProfile={onUpdateProfile} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Activity Type'), { target: { value: 'Running' } });
    fireEvent.change(screen.getByPlaceholderText('Mins'), { target: { value: '30' } });
    fireEvent.click(screen.getByText('Log Activity'));

    expect(onUpdateProfile).toHaveBeenCalledWith(expect.objectContaining({
      exerciseLogs: expect.any(Array),
    }));
  });

  test('adds medication', () => {
    render(
        <BrowserRouter>
            <Dashboard user={mockUser} activeProfile={mockProfile} onUpdateUser={onUpdateUser} onUpdateProfile={onUpdateProfile} />
        </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Metformin' } });
    fireEvent.change(screen.getByPlaceholderText('Dosage'), { target: { value: '500mg' } });
    fireEvent.click(screen.getByText('Add Medication'));

    expect(onUpdateProfile).toHaveBeenCalledWith(expect.objectContaining({
        currentMedications: expect.any(Array),
    }));
  });
});
