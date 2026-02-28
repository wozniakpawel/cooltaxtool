import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Provide localStorage for jsdom environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Mock react-apexcharts for testing (ApexCharts requires browser APIs not available in jsdom)
vi.mock('react-apexcharts', () => ({
  default: function MockChart() {
    return <div data-testid="mock-chart" />;
  },
}));
