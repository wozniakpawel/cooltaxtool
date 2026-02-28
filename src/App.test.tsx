import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header', () => {
  render(<App />);
  expect(screen.getByText('UK Tax Calculator & Visualiser')).toBeInTheDocument();
});

test('renders tax year selector', () => {
  render(<App />);
  expect(screen.getByText('Tax Year')).toBeInTheDocument();
  expect(screen.getByRole('combobox')).toBeInTheDocument();
});

test('renders dark mode toggle', () => {
  render(<App />);
  expect(screen.getByText('Dark mode')).toBeInTheDocument();
});
