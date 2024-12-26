import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StreakTracker from '../StreakTracker';

// Mock the Dashboard component
jest.mock('../../Analytics/Dashboard', () => ({
  __esModule: true,
  default: function MockDashboard(props) {
    return <div data-testid="dashboard">Dashboard Component</div>;
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

    expect(
      screen.getByText('Current Streak').nextElementSibling
    ).toHaveTextContent('3');
    expect(
      screen.getByText('Longest Streak').nextElementSibling
    ).toHaveTextContent('5');
  });

  it('renders zero streaks when no data provided', () => {
    renderStreakTracker();

    expect(
      screen.getByText('Current Streak').nextElementSibling
    ).toHaveTextContent('0');
    expect(
      screen.getByText('Longest Streak').nextElementSibling
    ).toHaveTextContent('0');
  });

  it('renders the Stats button', () => {
    renderStreakTracker();
    expect(screen.getByText('Stats')).toBeInTheDocument();
  });

  it('shows the Dashboard component', () => {
    renderStreakTracker();
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('opens dashboard when Stats button is clicked', () => {
    const { container } = renderStreakTracker();
    const statsButton = screen.getByText('Stats');

    fireEvent.click(statsButton);

    expect(
      container.querySelector('[data-testid="dashboard"]')
    ).toBeInTheDocument();
  });
});
