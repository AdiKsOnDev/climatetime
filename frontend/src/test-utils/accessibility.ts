import { axe } from 'jest-axe';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';

// Jest matchers are extended in setupTests.ts

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: ThemeProvider, ...options });

// Accessibility test helper
export const testAccessibility = async (container: HTMLElement) => {
  const results = await axe(container);
  expect(results.violations).toHaveLength(0);
  
  if (results.violations.length > 0) {
    console.error('Accessibility violations found:', results.violations);
  }
};

// Keyboard navigation test helper
export const testKeyboardNavigation = async (element: HTMLElement, keys: string[]) => {
  const user = (await import('@testing-library/user-event')).default.setup();
  
  for (const key of keys) {
    await user.keyboard(key);
  }
};

// Focus management test helper
export const testFocusManagement = async (
  container: HTMLElement,
  expectedFocusedElement: string
) => {
  const focusedElement = container.querySelector(':focus');
  const expectedElement = container.querySelector(expectedFocusedElement);
  expect(focusedElement).toBe(expectedElement);
};

// Screen reader test helper - checks for proper ARIA attributes
export const testScreenReaderSupport = (element: HTMLElement) => {
  // Check for proper labeling
  const hasAriaLabel = element.hasAttribute('aria-label');
  const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
  const hasAriaDescribedBy = element.hasAttribute('aria-describedby');
  const hasTitle = element.hasAttribute('title');
  
  expect(hasAriaLabel || hasAriaLabelledBy || hasAriaDescribedBy || hasTitle).toBeTruthy();
};

// Color contrast test helper (basic implementation)
export const testColorContrast = async (element: HTMLElement) => {
  const computedStyle = window.getComputedStyle(element);
  const backgroundColor = computedStyle.backgroundColor;
  const color = computedStyle.color;
  
  // Basic check - in a real implementation you'd calculate the actual contrast ratio
  expect(backgroundColor).not.toBe(color);
  expect(color).not.toBe('transparent');
  expect(backgroundColor).not.toBe('transparent');
};

export { customRender as render };

// Re-export everything from testing-library
export * from '@testing-library/react';