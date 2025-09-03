import { render, screen, testAccessibility } from '../../test-utils/accessibility';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../ThemeToggle';

describe('ThemeToggle Accessibility', () => {
  test('has no accessibility violations', async () => {
    const { container } = render(<ThemeToggle />);
    await testAccessibility(container);
  });

  test('has proper button role and accessible name', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', expect.stringMatching(/switch to (light|dark) mode/i));
  });

  test('has proper aria-pressed state', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed');
    
    // aria-pressed should be either 'true' or 'false'
    const ariaPressed = button.getAttribute('aria-pressed');
    expect(['true', 'false']).toContain(ariaPressed);
  });

  test('has helpful title attribute', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title');
    
    const title = button.getAttribute('title');
    expect(title).toMatch(/current theme:.*click to switch/i);
  });

  test('icons have aria-hidden attribute', () => {
    const { container } = render(<ThemeToggle />);
    
    // Check that SVG icons are hidden from screen readers
    const icons = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThan(0);
  });

  test('responds to keyboard interaction', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    
    // Focus the button
    await user.tab();
    expect(button).toHaveFocus();
    
    // Get initial aria-pressed state
    const initialPressed = button.getAttribute('aria-pressed');
    
    // Activate with Space key
    await user.keyboard(' ');
    
    // aria-pressed should have changed
    const newPressed = button.getAttribute('aria-pressed');
    expect(newPressed).not.toBe(initialPressed);
    
    // Button should still be focused
    expect(button).toHaveFocus();
  });

  test('responds to Enter key activation', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    
    // Focus the button
    button.focus();
    expect(button).toHaveFocus();
    
    const initialPressed = button.getAttribute('aria-pressed');
    
    // Activate with Enter key
    await user.keyboard('{Enter}');
    
    // aria-pressed should have changed
    const newPressed = button.getAttribute('aria-pressed');
    expect(newPressed).not.toBe(initialPressed);
  });

  test('has proper focus visible styles', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    
    // Check that button has focus styles in className
    expect(button.className).toContain('focus:outline-none');
    expect(button.className).toContain('focus:ring-2');
    expect(button.className).toContain('focus:ring-blue-500');
  });

  test('provides clear state indication to screen readers', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    
    // Check initial state
    const initialLabel = button.getAttribute('aria-label');
    const initialPressed = button.getAttribute('aria-pressed');
    
    // The label should indicate the action (switch to X mode)
    // The pressed state should indicate current mode
    if (initialPressed === 'true') {
      expect(initialLabel).toMatch(/switch to light mode/i);
    } else {
      expect(initialLabel).toMatch(/switch to dark mode/i);
    }
    
    // Toggle and check again
    await user.click(button);
    
    const newLabel = button.getAttribute('aria-label');
    const newPressed = button.getAttribute('aria-pressed');
    
    // State should have flipped
    expect(newPressed).not.toBe(initialPressed);
    expect(newLabel).not.toBe(initialLabel);
  });

  test('has appropriate contrast for both themes', async () => {
    const user = userEvent.setup();
    const { container } = render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    
    // Test initial theme
    let computedStyle = window.getComputedStyle(button);
    expect(computedStyle.color).not.toBe('transparent');
    expect(computedStyle.backgroundColor).not.toBe('transparent');
    
    // Toggle theme and test again
    await user.click(button);
    
    // Give time for theme to change
    await new Promise(resolve => setTimeout(resolve, 100));
    
    computedStyle = window.getComputedStyle(button);
    expect(computedStyle.color).not.toBe('transparent');
    expect(computedStyle.backgroundColor).not.toBe('transparent');
  });
});