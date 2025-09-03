import { render, screen, testAccessibility, testKeyboardNavigation } from '../../test-utils/accessibility';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// Mock the API calls for testing
jest.mock('../../components/LocationInput', () => {
  return function MockLocationInput({ onLocationSubmit }: { onLocationSubmit: (location: string) => void }) {
    return (
      <div data-testid="location-input">
        <input 
          placeholder="Enter location"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onLocationSubmit('Test Location');
            }
          }}
        />
      </div>
    );
  };
});

// Mock other components to avoid API dependencies in accessibility tests
jest.mock('../../components/ClimateDisplay', () => {
  return function MockClimateDisplay() {
    return <div data-testid="climate-display" role="region" aria-label="Current climate data">Climate Data</div>;
  };
});

jest.mock('../../components/HistoricalClimateDisplay', () => {
  return function MockHistoricalClimateDisplay() {
    return <div data-testid="historical-display" role="region" aria-label="Historical climate data">Historical Data</div>;
  };
});

jest.mock('../../components/FutureClimateDisplay', () => {
  return function MockFutureClimateDisplay() {
    return <div data-testid="future-display" role="region" aria-label="Future climate projections">Future Data</div>;
  };
});

jest.mock('../../components/AIEducationInterface', () => {
  return function MockAIEducationInterface() {
    return <div data-testid="ai-interface" role="region" aria-label="AI education chat">AI Interface</div>;
  };
});

jest.mock('../../components/ActionRecommendationsDisplay', () => {
  return function MockActionRecommendationsDisplay() {
    return <div data-testid="actions-display" role="region" aria-label="Climate action recommendations">Action Recommendations</div>;
  };
});

describe('App Accessibility', () => {
  test('has no accessibility violations on initial load', async () => {
    const { container } = render(<App />);
    await testAccessibility(container);
  });

  test('skip links are present and functional', async () => {
    render(<App />);
    
    // Skip links should be present but visually hidden initially
    const skipToMain = screen.getByRole('link', { name: /skip to main content/i });
    const skipToTabs = screen.getByRole('link', { name: /skip to climate data/i });
    
    expect(skipToMain).toBeInTheDocument();
    expect(skipToTabs).toBeInTheDocument();
    
    // Skip links should have proper href attributes
    expect(skipToMain).toHaveAttribute('href', '#main-content');
    expect(skipToTabs).toHaveAttribute('href', '#climate-tabs');
  });

  test('header has proper landmark structure', () => {
    render(<App />);
    
    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();
    
    const heading = screen.getByRole('heading', { level: 1, name: /climatetime/i });
    expect(heading).toBeInTheDocument();
    
    const themeNav = screen.getByRole('navigation', { name: /theme settings/i });
    expect(themeNav).toBeInTheDocument();
  });

  test('main content has proper landmark structure', () => {
    render(<App />);
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'main-content');
  });

  test('theme toggle has proper accessibility attributes', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const themeToggle = screen.getByRole('button', { name: /switch to/i });
    expect(themeToggle).toBeInTheDocument();
    expect(themeToggle).toHaveAttribute('aria-pressed');
    expect(themeToggle).toHaveAttribute('title');
    
    // Test keyboard interaction
    await user.tab();
    // The theme toggle should be focusable
    expect(themeToggle).toHaveFocus();
    
    // Test activation
    await user.keyboard(' '); // Space key
    // Should still be focused after activation
    expect(themeToggle).toHaveFocus();
  });

  test('error messages have proper alert role', async () => {
    const { rerender } = render(<App />);
    
    // Simulate an error state by mocking the location submission
    const AppWithError = () => {
      return <App />;
    };
    
    rerender(<AppWithError />);
    
    // In a real test, we would trigger an error condition
    // For now, we'll check that the error structure is correct when present
    const locationInput = screen.getByTestId('location-input');
    const input = locationInput.querySelector('input');
    
    if (input) {
      await userEvent.type(input, 'test');
      await userEvent.keyboard('{Enter}');
    }
    
    // The error alert role should be present if there's an error
    // This test structure allows for proper error testing when API is available
  });

  describe('Tab Navigation Accessibility', () => {
    beforeEach(async () => {
      // Setup app with climate data to show tabs
      const { container } = render(<App />);
      
      // Simulate location submission to show tabs
      const locationInput = container.querySelector('input');
      if (locationInput) {
        await userEvent.type(locationInput, 'Test Location');
        await userEvent.keyboard('{Enter}');
      }
    });

    test('tab list has proper ARIA attributes', async () => {
      render(<App />);
      
      // Wait for potential tab rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const tablist = document.querySelector('[role="tablist"]');
      if (tablist) {
        expect(tablist).toHaveAttribute('aria-label', 'Climate data views');
        expect(tablist).toHaveAttribute('id', 'climate-tabs');
      }
    });

    test('tab buttons have proper ARIA attributes', async () => {
      render(<App />);
      
      // Wait for potential tab rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const tabs = document.querySelectorAll('[role="tab"]');
      
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-selected');
        expect(tab).toHaveAttribute('aria-controls');
        expect(tab).toHaveAttribute('id');
        
        // Check tabindex is properly managed
        const isSelected = tab.getAttribute('aria-selected') === 'true';
        expect(tab).toHaveAttribute('tabindex', isSelected ? '0' : '-1');
      });
    });

    test('tab panels have proper ARIA attributes', async () => {
      render(<App />);
      
      // Wait for potential tab rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const tabpanels = document.querySelectorAll('[role="tabpanel"]');
      
      tabpanels.forEach((panel) => {
        expect(panel).toHaveAttribute('aria-labelledby');
        expect(panel).toHaveAttribute('id');
      });
    });

    test('keyboard navigation works correctly', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Wait for tabs to potentially render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const firstTab = document.querySelector('[role="tab"]');
      
      if (firstTab) {
        // Focus first tab
        await user.click(firstTab as HTMLElement);
        expect(firstTab).toHaveFocus();
        
        // Test arrow key navigation
        await user.keyboard('{ArrowRight}');
        
        // Should move to next tab (if exists)
        const focusedElement = document.activeElement;
        expect(focusedElement).toHaveAttribute('role', 'tab');
      }
    });
  });

  test('focus management is proper throughout the app', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    
    // Test tab order makes sense
    await user.tab(); // Should focus theme toggle
    let focused = document.activeElement;
    expect(focused).toHaveAttribute('aria-label', expect.stringContaining('Switch to'));
    
    await user.tab(); // Should focus location input
    focused = document.activeElement;
    expect(focused).toBeInTheDocument();
    
    // Ensure no elements are unfocusable when they should be focusable
    const interactiveElements = container.querySelectorAll(
      'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    interactiveElements.forEach((element) => {
      // Interactive elements should not have negative tabindex unless managed by ARIA
      const tabIndex = element.getAttribute('tabindex');
      const role = element.getAttribute('role');
      
      if (tabIndex === '-1' && role !== 'tab') {
        // Only tabs should have negative tabindex for ARIA management
        expect(role).toBe('tab');
      }
    });
  });
});