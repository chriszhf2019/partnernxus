import { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { EcosystemDashboard } from './components/dashboard/EcosystemDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { usePartners, useDeals, useActivities } from './hooks/useData';
import { Shield, HelpCircle, Loader2 } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { ThemeProvider } from './contexts/ThemeContext';

const PartnerList = lazy(() => import('./components/partners/PartnerList').then(m => ({ default: m.PartnerList })));
const PartnerProfile = lazy(() => import('./components/partners/PartnerProfile').then(m => ({ default: m.PartnerProfile })));
const MarketingIncentivePage = lazy(() => import('./components/marketing/MarketingIncentivePage').then(m => ({ default: m.MarketingIncentivePage })));
const DealRegistrationPage = lazy(() => import('./components/deals/DealRegistrationPage').then(m => ({ default: m.DealRegistrationPage })));
const DealRegistrationForm = lazy(() => import('./components/deals/DealRegistrationForm').then(m => ({ default: m.DealRegistrationForm })));
const SettingsPage = lazy(() => import('./components/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
  </div>
);

function EcosystemRoute() {
  const navigate = useNavigate();
  const handleNavigate = (view: string) => {
    const route = ['partners', 'deals', 'marketing', 'settings'].includes(view) ? `/${view}` : '/ecosystem';
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
  const { partners: initialPartners } = usePartners();
  const [partners, setPartners] = useState(initialPartners);

  const handleImport = (imported: typeof initialPartners, mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setPartners(imported);
    } else {
      const existingIds = new Set(partners.map((p) => p.id));
      const newItems = imported.filter((p) => !existingIds.has(p.id));
      setPartners([...partners, ...newItems]);
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
  const { getPartnerById } = usePartners();
  const { activities } = useActivities();
  const navigate = useNavigate();

  const partner = id ? getPartnerById(id) : null;

  if (!partner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <p className="text-lg font-black text-slate-400">Partner not found</p>
        <button onClick={() => navigate('/partners')} className="text-sm font-bold text-primary hover:underline">Back to Partner List</button>
      </div>
    );
  }

  // Build dynamic PartnerDetails with generated mock data based on real partner
  const partnerDetails = {
    ...partner,
    pipeline: {
      registered: 0,
      solution: 0,
      commercial: 0,
      won: 0,
    },
    mdf: {
      total: 0,
      used: 0,
      remaining: 0,
      activities: [],
    },
    enablement: {
      certifiedEngineers: partner.contacts.length,
      specialists: Math.max(1, Math.floor(partner.contacts.length / 3)),
      expiryRiskCount: 0,
      expiryDays: 0,
    },
    followUps: [],
    topProjects: [],
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <TopNav />

        <main className="flex-1 pt-24 pb-12 px-8 max-w-[1600px] mx-auto w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/ecosystem" replace />} />
            <Route path="/ecosystem" element={<EcosystemRoute />} />
            <Route path="/partners" element={<PartnersRoute />} />
            <Route path="/partners/:id" element={<PartnerProfileRoute />} />
            <Route path="/deals" element={<DealsRoute />} />
            <Route path="/deals/new" element={<NewDealRoute />} />
            <Route path="/marketing" element={<MarketingRoute />} />
            <Route path="/settings" element={<SettingsRoute />} />
          </Routes>
        </main>

        <footer className="mt-auto border-t border-surface-container-low dark:border-slate-800 p-6 flex justify-center items-center gap-10">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-slate-400 font-medium">
            <Shield className="w-4 h-4" />
            {t('footer.secure')}
          </div>
          <div className="h-4 w-px bg-surface-container-highest dark:bg-slate-700"></div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-slate-400 font-medium">
            <HelpCircle className="w-4 h-4" />
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
        <LanguageProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </LanguageProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
}
