import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';

function TestConsumer() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="dashboard">{t('dashboard.title')}</span>
      <button onClick={() => setLanguage('en')}>Switch to EN</button>
      <button onClick={() => setLanguage('zh')}>Switch to ZH</button>
    </div>
  );
}

describe('LanguageContext', () => {
  it('defaults to zh', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('lang')).toHaveTextContent('zh');
  });

  it('returns Chinese translation by default', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('dashboard')).toHaveTextContent('工作台');
  });

  it('switches to English', async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    await user.click(screen.getByText('Switch to EN'));
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(screen.getByTestId('dashboard')).toHaveTextContent('Dashboard');
  });

  it('falls back to key on missing translation', () => {
    function MissingKeyConsumer() {
      const { t } = useLanguage();
      return <span data-testid="missing">{t('nonexistent.key.xyz')}</span>;
    }
    render(
      <LanguageProvider>
        <MissingKeyConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('missing')).toHaveTextContent('nonexistent.key.xyz');
  });
});
