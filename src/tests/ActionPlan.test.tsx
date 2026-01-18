
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ActionPlan from '../../components/ActionPlan';
import { User, Profile } from '../../types';
import * as geminiService from '../../services/geminiService';
import { vi } from 'vitest';

// Mock geminiService
vi.mock('../../services/geminiService', () => ({
  getEthnicMealRecommendations: vi.fn(),
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

describe('ActionPlan component', () => {
  const onUpdateProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders timeline tab by default', () => {
    render(
      <BrowserRouter>
        <ActionPlan user={mockUser} activeProfile={mockProfile} onUpdateProfile={onUpdateProfile} />
      </BrowserRouter>
    );

    expect(screen.getByText('Your Weekly Timeline')).toBeInTheDocument();
  });

  test('switches to workouts tab and adds a plan', () => {
    render(
      <BrowserRouter>
        <ActionPlan user={mockUser} activeProfile={mockProfile} onUpdateProfile={onUpdateProfile} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Workouts'));
    expect(screen.getByText('Biological Simulations')).toBeInTheDocument();

    fireEvent.click(screen.getAllByText('Add to My Week')[0]);
    expect(onUpdateProfile).toHaveBeenCalledWith(expect.objectContaining({
      myExercisePlans: expect.any(Array),
    }));
  });

  test('switches to cuisine tab and fetches meals', async () => {
    (geminiService.getEthnicMealRecommendations as vi.Mock).mockResolvedValue([]);
    render(
      <BrowserRouter>
        <ActionPlan user={mockUser} activeProfile={mockProfile} onUpdateProfile={onUpdateProfile} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Cuisine'));
    fireEvent.click(screen.getByText('Regenerate Weekly Menu'));

    await waitFor(() => {
      expect(geminiService.getEthnicMealRecommendations).toHaveBeenCalled();
    });
  });

  test('handles error when fetching meals', async () => {
    (geminiService.getEthnicMealRecommendations as vi.Mock).mockRejectedValue(new Error('API Error'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <ActionPlan user={mockUser} activeProfile={mockProfile} onUpdateProfile={onUpdateProfile} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Cuisine'));
    fireEvent.click(screen.getByText('Regenerate Weekly Menu'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('API Error'));
    });

    consoleErrorSpy.mockRestore();
  });
});
