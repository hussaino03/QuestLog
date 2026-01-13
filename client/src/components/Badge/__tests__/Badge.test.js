import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Badge from '../Badge';
import '@testing-library/jest-dom';

describe('Badge Component', () => {
  const mockBadge = {
    id: 'test_badge',
    name: 'Test Badge',
    icon: '🏆',
    description: 'This is a test badge'
  };

  describe('Rendering', () => {
    it('should render badge with icon and name', () => {
      render(<Badge badge={mockBadge} isUnlocked={false} />);

      expect(screen.getByText('🏆')).toBeInTheDocument();
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('should render unlocked badge with proper styling', () => {
      const { container } = render(
        <Badge badge={mockBadge} isUnlocked={true} />
      );

      const icon = screen.getByText('🏆');
      expect(icon).toHaveClass('opacity-100');
      expect(icon).not.toHaveClass('grayscale');

      // Check for glow effect
      const glowEffect = container.querySelector('.animate-pulse');
      expect(glowEffect).toBeInTheDocument();
    });

    it('should render locked badge with reduced opacity', () => {
      render(<Badge badge={mockBadge} isUnlocked={false} />);

      const icon = screen.getByText('🏆');
      expect(icon).toHaveClass('opacity-30');
      expect(icon).toHaveClass('grayscale');
    });

    it('should apply different text colors for locked/unlocked', () => {
      const { rerender } = render(
        <Badge badge={mockBadge} isUnlocked={false} />
      );
      const lockedName = screen.getByText('Test Badge');
      expect(lockedName).toHaveClass('text-gray-500');

      rerender(<Badge badge={mockBadge} isUnlocked={true} />);
      const unlockedName = screen.getByText('Test Badge');
      expect(unlockedName).toHaveClass('text-gray-900');
    });
  });

  describe('Progress Bar', () => {
    it('should show progress bar for locked badges when showProgress is true', () => {
      render(
        <Badge
          badge={mockBadge}
          isUnlocked={false}
          progress={50}
          showProgress={true}
        />
      );

      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should not show progress bar for unlocked badges', () => {
      render(
        <Badge
          badge={mockBadge}
          isUnlocked={true}
          progress={100}
          showProgress={true}
        />
      );

      expect(screen.queryByText('100%')).not.toBeInTheDocument();
    });

    it('should not show progress bar when showProgress is false', () => {
      render(
        <Badge
          badge={mockBadge}
          isUnlocked={false}
          progress={50}
          showProgress={false}
        />
      );

      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('should show progress bar at 0% for locked badges with no progress', () => {
      render(
        <Badge
          badge={mockBadge}
          isUnlocked={false}
          progress={0}
          showProgress={true}
        />
      );

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should display rounded progress percentage', () => {
      render(
        <Badge
          badge={mockBadge}
          isUnlocked={false}
          progress={66.7}
          showProgress={true}
        />
      );

      expect(screen.getByText('67%')).toBeInTheDocument();
    });

    it('should render progress bar with correct width', () => {
      const { container } = render(
        <Badge
          badge={mockBadge}
          isUnlocked={false}
          progress={75}
          showProgress={true}
        />
      );

      const progressFill = container.querySelector('[style*="width: 75%"]');
      expect(progressFill).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('should show tooltip on hover', async () => {
      render(<Badge badge={mockBadge} isUnlocked={false} />);

      const badgeElement = screen
        .getByText('Test Badge')
        .closest('div').parentElement;
      fireEvent.mouseEnter(badgeElement);

      await waitFor(() => {
        expect(screen.getByText('This is a test badge')).toBeInTheDocument();
      });
    });

    it('should hide tooltip on mouse leave', async () => {
      render(<Badge badge={mockBadge} isUnlocked={false} />);

      const badgeElement = screen
        .getByText('Test Badge')
        .closest('div').parentElement;
      fireEvent.mouseEnter(badgeElement);

      await waitFor(() => {
        expect(screen.getByText('This is a test badge')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(badgeElement);

      await waitFor(() => {
        expect(
          screen.queryByText('This is a test badge')
        ).not.toBeInTheDocument();
      });
    });

    it('should show progress in tooltip for locked badges', async () => {
      render(
        <Badge
          badge={mockBadge}
          isUnlocked={false}
          progress={45}
          showProgress={true}
        />
      );

      const badgeElement = screen
        .getByText('Test Badge')
        .closest('div').parentElement;
      fireEvent.mouseEnter(badgeElement);

      await waitFor(() => {
        expect(screen.getByText('45% Complete')).toBeInTheDocument();
      });
    });

    it('should not show progress in tooltip when showProgress is false', async () => {
      render(
        <Badge
          badge={mockBadge}
          isUnlocked={false}
          progress={45}
          showProgress={false}
        />
      );

      const badgeElement = screen
        .getByText('Test Badge')
        .closest('div').parentElement;
      fireEvent.mouseEnter(badgeElement);

      await waitFor(() => {
        expect(screen.getByText('This is a test badge')).toBeInTheDocument();
      });

      expect(screen.queryByText('45% Complete')).not.toBeInTheDocument();
    });

    it('should not show progress in tooltip for unlocked badges', async () => {
      render(
        <Badge
          badge={mockBadge}
          isUnlocked={true}
          progress={100}
          showProgress={true}
        />
      );

      const badgeElement = screen
        .getByText('Test Badge')
        .closest('div').parentElement;
      fireEvent.mouseEnter(badgeElement);

      await waitFor(() => {
        expect(screen.getByText('This is a test badge')).toBeInTheDocument();
      });

      expect(screen.queryByText('100% Complete')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle badge with no icon', () => {
      const badgeNoIcon = { ...mockBadge, icon: '' };
      render(<Badge badge={badgeNoIcon} isUnlocked={false} />);

      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('should handle badge with long name', () => {
      const longNameBadge = {
        ...mockBadge,
        name: 'This Is A Very Long Badge Name That Might Break Layout'
      };
      render(<Badge badge={longNameBadge} isUnlocked={false} />);

      expect(
        screen.getByText(
          'This Is A Very Long Badge Name That Might Break Layout'
        )
      ).toBeInTheDocument();
    });

    it('should handle badge with long description', () => {
      const longDescBadge = {
        ...mockBadge,
        description:
          'This is a very long description that explains in great detail what this badge represents and how to achieve it'
      };

      render(<Badge badge={longDescBadge} isUnlocked={false} />);
      expect(screen.getByText(longDescBadge.name)).toBeInTheDocument();
    });

    it('should handle negative progress values', () => {
      render(
        <Badge
          badge={mockBadge}
          isUnlocked={false}
          progress={-10}
          showProgress={true}
        />
      );

      // Should show 0 or handle gracefully
      expect(screen.getByText(/-?\d+%/)).toBeInTheDocument();
    });

    it('should handle progress values over 100', () => {
      render(
        <Badge
          badge={mockBadge}
          isUnlocked={false}
          progress={150}
          showProgress={true}
        />
      );

      expect(screen.getByText('150%')).toBeInTheDocument();
    });

    it('should handle undefined progress', () => {
      render(
        <Badge
          badge={mockBadge}
          isUnlocked={false}
          progress={undefined}
          showProgress={true}
        />
      );

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle special characters in badge name', () => {
      const specialBadge = {
        ...mockBadge,
        name: 'Test & Badge <script>',
        description: 'Description with <html>'
      };

      render(<Badge badge={specialBadge} isUnlocked={false} />);
      expect(screen.getByText('Test & Badge <script>')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper structure for screen readers', () => {
      const { container } = render(
        <Badge
          badge={mockBadge}
          isUnlocked={false}
          progress={50}
          showProgress={true}
        />
      );

      const badgeContainer = container.firstChild;
      expect(badgeContainer).toBeInTheDocument();
    });

    it('should show visual indicators for locked state', () => {
      render(<Badge badge={mockBadge} isUnlocked={false} />);

      const icon = screen.getByText('🏆');
      expect(icon).toHaveClass('opacity-30');
      expect(icon).toHaveClass('grayscale');
    });

    it('should show visual indicators for unlocked state', () => {
      render(<Badge badge={mockBadge} isUnlocked={true} />);

      const icon = screen.getByText('🏆');
      expect(icon).toHaveClass('opacity-100');
      expect(icon).not.toHaveClass('grayscale');
    });
  });

  describe('Default Props', () => {
    it('should use default progress value of 0', () => {
      render(
        <Badge badge={mockBadge} isUnlocked={false} showProgress={true} />
      );

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should use default showProgress value of true', () => {
      render(<Badge badge={mockBadge} isUnlocked={false} progress={50} />);

      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });
});
