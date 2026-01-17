// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock react-apexcharts for testing (ApexCharts requires browser APIs not available in Jest)
jest.mock('react-apexcharts', () => {
  return function MockChart() {
    return <div data-testid="mock-chart" />;
  };
});
