import { Suspense, lazy, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageLoader } from './components/ui/PageLoader';
import { NetworkStatus } from './components/ui/NetworkStatus';
import { ToastProvider } from './components/ui/Toast';
import { usePartners, useDeals, useActivities } from './hooks/useData';
import { Shield, HelpCircle } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { AuthGuard } from './components/auth/AuthGuard';
import type { PartnerDetails } from './types';

const EcosystemDashboard = lazy(() => import('./components/dashboard/EcosystemDashboard').then(m => ({ default: m.EcosystemDashboard })));
const PartnerList = lazy(() => import('./components/partners/PartnerList').then(m => ({ default: m.PartnerList })));
const PartnerProfile = lazy(() => import('./components/partners/PartnerProfile').then(m => ({ default: m.PartnerProfile })));
const MarketingIncentivePage = lazy(() => import('./components/marketing/MarketingIncentivePage').then(m => ({ default: m.MarketingIncentivePage })));
const DealRegistrationPage = lazy(() => import('./components/deals/DealRegistrationPage').then(m => ({ default: m.DealRegistrationPage })));
const DealRegistrationForm = lazy(() => import('./components/deals/DealRegistrationForm').then(m => ({ default: m.DealRegistrationForm })));
const SettingsPage = lazy(() => import('./components/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const IncentivesPage = lazy(() => import('./components/marketing/IncentivesPage').then(m => ({ default: m.IncentivesPage })));
const EnablementPage = lazy(() => import('./components/marketing/EnablementPage').then(m => ({ default: m.EnablementPage })));
const AnalyticsPage = lazy(() => import('./components/marketing/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ChannelDashboard = lazy(() => import('./components/marketing/ChannelDashboard').then(m => ({ default: m.ChannelDashboard })));

function EcosystemRoute() {
  const navigate = useNavigate();
  const handleNavigate = (view: string) => {
    const route = ['partners', 'deals', 'marketing', 'incentives', 'enablement', 'analytics', 'settings'].includes(view) ? `/${view}` : '/ecosystem';
    navigate(route);
  };
  return (
    <div className="space-y-6">
      <ErrorBoundary>
        <EcosystemDashboard
          onViewChange={handleNavigate}
          onSelectPartner={(id) => navigate(`/partners/${id}`)}
        />
      </ErrorBoundary>
    </div>
  );
}

function PartnersRoute() {
  const navigate = useNavigate();
  const { partners: initialPartners, partnerListRef } = usePartners();
  const [partners, setPartners] = useState(initialPartners);

  // Sync local state to ref so PartnerProfileRoute can find imported partners
  partnerListRef.current = partners;

  const handleImport = (imported: typeof initialPartners, mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setPartners(imported);
    } else {
      const existingIds = new Set(partners.map((p) => p.id));
      const newItems = imported.filter((p) => !existingIds.has(p.id));
      setPartners(prev => [...prev, ...newItems]);
    }
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <PartnerList
          partners={partners}
          onSelectPartner={(id) => navigate(`/partners/${id}`)}
          onImport={handleImport}
        />
      </Suspense>
    </ErrorBoundary>
  );
}

function PartnerProfileRoute() {
  const { id } = useParams<{ id: string }>();
  const { partnerListRef } = usePartners();
  const { activities } = useActivities();
  const navigate = useNavigate();

  // Look up from the mutable ref first (for imported partners), fall back to static import
  const partner = id
    ? (partnerListRef.current.find((p) => p.id === id) || partnerListRef.current[0])
    : null;

  if (!partner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <p className="text-lg font-black text-slate-400">Partner not found</p>
        <button onClick={() => navigate('/partners')} className="text-sm font-bold text-primary hover:underline">Back to Partner List</button>
      </div>
    );
  }

  const partnerDetails: PartnerDetails = {
    ...partner,
    pipeline: { registered: 0, solution: 0, commercial: 0, won: 0 },
    mdf: { total: 0, used: 0, remaining: 0, activities: [] },
    enablement: {
      certifiedEngineers: partner.contacts.length,
      specialists: Math.max(1, Math.floor(partner.contacts.length / 3)),
      expiryRiskCount: 0,
      expiryDays: 0,
    },
    followUps: [],
    topProjects: [],
    cooperationPlans: [],
    cooperationRecords: [],
    subPartners: [],
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <PartnerProfile
          partner={partnerDetails}
          activities={activities}
          onBack={() => navigate('/partners')}
        />
      </Suspense>
    </ErrorBoundary>
  );
}

function DealsRoute() {
  const navigate = useNavigate();
  const { deals: initialDeals, stats } = useDeals();
  const [deals, setDeals] = useState(initialDeals);

  const handleDealUpdate = (updatedDeal: typeof initialDeals[number]) => {
    setDeals(prev => prev.map(d => d.id === updatedDeal.id ? updatedDeal : d));
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <DealRegistrationPage
          stats={stats}
          deals={deals}
          onNewDeal={() => navigate('/deals/new')}
          onDealUpdate={handleDealUpdate}
        />
      </Suspense>
    </ErrorBoundary>
  );
}

function NewDealRoute() {
  const { t } = useLanguage();
  return (
    <ErrorBoundary>
      <div className="space-y-10">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">{t('newDeal.title')}</h1>
          <p className="text-on-surface-variant text-lg">{t('newDeal.subtitle')}</p>
        </div>
        <Suspense fallback={<PageLoader />}>
          <DealRegistrationForm />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

function MarketingRoute() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <MarketingIncentivePage />
      </Suspense>
    </ErrorBoundary>
  );
}

function IncentivesRoute() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <IncentivesPage />
      </Suspense>
    </ErrorBoundary>
  );
}

function EnablementRoute() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <EnablementPage />
      </Suspense>
    </ErrorBoundary>
  );
}

function AnalyticsRoute() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <AnalyticsPage />
      </Suspense>
    </ErrorBoundary>
  );
}

function SettingsRoute() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <SettingsPage />
      </Suspense>
    </ErrorBoundary>
  );
}

function AppLayout() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex">
      <Sidebar />

      <div className="flex-1 ml-60 flex flex-col">
        <NetworkStatus />
        <TopNav />

        <main className="flex-1 pt-20 pb-16 px-8 max-w-[1440px] mx-auto w-full">
          <AuthGuard>
            <Routes>
              <Route path="/" element={<Navigate to="/ecosystem" replace />} />
              <Route path="/ecosystem" element={<EcosystemRoute />} />
              <Route path="/partners" element={<PartnersRoute />} />
              <Route path="/partners/:id" element={<PartnerProfileRoute />} />
              <Route path="/deals" element={<DealsRoute />} />
              <Route path="/deals/new" element={<NewDealRoute />} />
              <Route path="/marketing" element={<MarketingRoute />} />
              <Route path="/incentives" element={<IncentivesRoute />} />
              <Route path="/enablement" element={<EnablementRoute />} />
              <Route path="/analytics" element={<AnalyticsRoute />} />
              <Route path="/settings" element={<SettingsRoute />} />
              <Route path="/channels" element={<Suspense fallback={<PageLoader />}><ChannelDashboard /></Suspense>} />
            </Routes>
          </AuthGuard>
        </main>

        <footer className="mt-auto border-t border-neutral-200 dark:border-neutral-800 py-3 flex justify-center items-center gap-6">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <Shield className="w-3.5 h-3.5" />
            {t('footer.secure')}
          </div>
          <div className="h-3 w-px bg-neutral-200 dark:bg-neutral-700" />
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <HelpCircle className="w-3.5 h-3.5" />
            {t('footer.assistance')}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ConfigProvider>
        <AuthProvider>
          <LanguageProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<AppLayout />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
}
