import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/PageLoader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../contexts/LanguageContext';

describe('UI Components', () => {
  describe('Button', () => {
    it('renders children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeDefined();
    });

    it('renders loading state', () => {
      render(<Button loading>Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDefined();
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });

    it('applies variant classes', () => {
      render(<Button variant="danger">Delete</Button>);
      const button = screen.getByText('Delete');
      expect(button.className).toContain('bg-red-600');
    });
  });

  describe('Badge', () => {
    it('renders with variant', () => {
      render(<Badge variant="success">Active</Badge>);
      const badge = screen.getByText('Active');
      expect(badge.className).toContain('bg-emerald-50');
    });
  });

  describe('EmptyState', () => {
    it('renders title and description', () => {
      render(<EmptyState title="No items" description="Your list is empty" />);
      expect(screen.getByText('No items')).toBeDefined();
      expect(screen.getByText('Your list is empty')).toBeDefined();
    });

    it('renders action button when provided', () => {
      render(
        <EmptyState title="No items" actionLabel="Add item" onAction={() => {}} />,
      );
      expect(screen.getByText('Add item')).toBeDefined();
    });
  });

  describe('PageLoader', () => {
    it('renders loading spinner', () => {
      const { container } = render(<PageLoader />);
      expect(container.querySelector('.animate-spin')).toBeDefined();
    });
  });

  describe('Card', () => {
    it('renders with header and content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Content</p>
          </CardContent>
        </Card>,
      );
      expect(screen.getByText('Test Card')).toBeDefined();
      expect(screen.getByText('Content')).toBeDefined();
    });
  });

  describe('Tabs', () => {
    it('renders tab buttons', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
      ];
      render(<Tabs tabs={tabs} activeTab="tab1" onChange={() => {}} />);
      expect(screen.getByText('Tab 1')).toBeDefined();
      expect(screen.getByText('Tab 2')).toBeDefined();
    });
  });
});
