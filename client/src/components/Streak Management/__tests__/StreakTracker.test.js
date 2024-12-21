import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StreakTracker from '../StreakTracker';

/*
Component render tests -> logic test is in src/services/streak
*/

// Add required test setup
window.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: { register: jest.fn() },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

jest.mock('react-chartjs-2', () => ({
  Line: ({ data }) => {
    if (!data || !data.datasets || !data.datasets[0].data.some(val => val > 0)) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
          No XP data available
        </div>
      );
    }
    return <div data-testid="xp-chart">Mocked Chart</div>;
  }
}));

describe('StreakTracker Component', () => {
  const renderStreakTracker = (props = {}) => {
    const defaultProps = {
      completedTasks: [],
      streakData: { current: 0, longest: 0 },
      ...props
    };
    return render(<StreakTracker {...defaultProps} />);
  };

  it('renders streak data correctly', () => {
    const mockStreakData = {
      current: 3,
      longest: 5
    };

    renderStreakTracker({ streakData: mockStreakData });
    
    expect(screen.getByText('Current Streak').nextElementSibling).toHaveTextContent('3');
    expect(screen.getByText('Longest Streak').nextElementSibling).toHaveTextContent('5');
  });

  it('renders zero streaks when no data provided', () => {
    renderStreakTracker();
    
    expect(screen.getByText('Current Streak').nextElementSibling).toHaveTextContent('0');
    expect(screen.getByText('Longest Streak').nextElementSibling).toHaveTextContent('0');
  });

  it('shows XP Growth section with completed tasks data', () => {
    const mockCompletedTasks = [
      { completedAt: new Date().toISOString(), experience: 100 },
      { completedAt: new Date().toISOString(), experience: 150 }
    ];

    renderStreakTracker({ 
      completedTasks: mockCompletedTasks,
      streakData: { current: 2, longest: 2 }
    });
    
    expect(screen.getByText('XP Growth')).toBeInTheDocument();
  });

  it('shows no data message when no completed tasks', () => {
    renderStreakTracker({ 
      completedTasks: [],
      streakData: { current: 0, longest: 0 }
    });
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('shows Analytics button', () => {
    renderStreakTracker();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('shows metrics when XP data is available', () => {
    const mockCompletedTasks = [
      { completedAt: new Date().toISOString(), experience: 100 },
      { completedAt: new Date().toISOString(), experience: 150 }
    ];

    renderStreakTracker({ 
      completedTasks: mockCompletedTasks,
      streakData: { current: 2, longest: 2 }
    });
    
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText(/Peak Day/)).toBeInTheDocument();
    expect(screen.getByText(/Average Daily/)).toBeInTheDocument();
  });
});