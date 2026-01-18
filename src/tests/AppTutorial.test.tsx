
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import AppTutorial from '../../components/AppTutorial';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('AppTutorial component', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('is not visible by default', () => {
    render(
        <BrowserRouter>
            <AppTutorial />
        </BrowserRouter>
    );
    expect(screen.queryByText("Welcome to Diabetes Hub")).not.toBeInTheDocument();
  });

  test('becomes visible and shows first step on startTutorial event', () => {
    render(
        <BrowserRouter>
            <AppTutorial />
        </BrowserRouter>
    );

    fireEvent(window, new Event('startTutorial'));

    expect(screen.getByText("Welcome to Diabetes Hub")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 12")).toBeInTheDocument();
  });

  test('goes to the next step when "Next Step" is clicked', () => {
    render(
        <BrowserRouter>
            <AppTutorial />
        </BrowserRouter>
    );

    fireEvent(window, new Event('startTutorial'));

    fireEvent.click(screen.getByText('Next Step'));

    expect(screen.getByText("Health Education")).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 12")).toBeInTheDocument();
    expect(mockedNavigate).toHaveBeenCalledWith('/education');
  });

  test('goes to the previous step when "Prev" is clicked', () => {
    render(
        <MemoryRouter initialEntries={['/education']}>
            <Routes>
                <Route path="/education" element={<AppTutorial />} />
            </Routes>
        </MemoryRouter>
    );

    fireEvent(window, new Event('startTutorial'));

    // Go to step 2
    fireEvent.click(screen.getByText('Next Step'));
    expect(screen.getByText("Health Education")).toBeInTheDocument();


    // Go back to step 1
    fireEvent.click(screen.getByText('Prev'));
    expect(screen.getByText("Welcome to Diabetes Hub")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 12")).toBeInTheDocument();
  });


  test('hides when the close button is clicked', () => {
    render(
        <BrowserRouter>
            <AppTutorial />
        </BrowserRouter>
    );

    fireEvent(window, new Event('startTutorial'));

    expect(screen.getByText("Welcome to Diabetes Hub")).toBeInTheDocument();

    const allButtons = screen.getAllByRole('button');
    const closeButton = allButtons.find(button => button.textContent === '');
    expect(closeButton).toBeDefined();
    fireEvent.click(closeButton!)

    expect(screen.queryByText("Welcome to Diabetes Hub")).not.toBeInTheDocument();
  });


  test('finishes the tutorial on the last step', () => {
    render(
        <BrowserRouter>
            <AppTutorial />
        </BrowserRouter>
    );

    fireEvent(window, new Event('startTutorial'));

    // Click through all steps
    for (let i = 0; i < 11; i++) {
        fireEvent.click(screen.getByText('Next Step'));
    }

    expect(screen.getByText("You're All Set!")).toBeInTheDocument();
    expect(screen.getByText('Finish')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Finish'));

    expect(screen.queryByText("You're All Set!")).not.toBeInTheDocument();
  });

});
