import { useState, useMemo, useCallback } from 'react';
import './index.css';
import { syntheticData, getLatestRecord, getRecentRecords } from './data/syntheticData';
import { generateForecast } from './engines/forecastEngine';
import { calculatePressure } from './engines/pressureEngine';
import { analyzeBottlenecks } from './engines/bottleneckEngine';
import { generateRecommendations } from './engines/recommendationEngine';
import { runWhatIfSimulation, WhatIfParams } from './engines/whatIfSimulator';
import { assessDataQuality } from './engines/dataQualityEngine';
import { PageId, SimulationInputs, inputsFromRecord, applyInputsToRecord, applyScenario } from './types';
import { AppRoute } from './routes';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { DemoModeBanner } from './components/BrandLogo';

// Auth Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { AccessDeniedPage } from './pages/auth/AccessDeniedPage';
import { AdminPage } from './pages/AdminPage';

// App Shell Components
import Sidebar from './components/Sidebar';
import { Topbar } from './components/Topbar';

// Operational Pages
import CommandCenter from './components/pages/CommandCenter';
import ForecastInputs from './components/pages/ForecastInputs';
import PatientFlowPage from './components/pages/PatientFlowPage';
import ResourcesPage from './components/pages/ResourcesPage';
import ScenariosPage from './components/pages/ScenariosPage';
import WhatIfPage from './components/pages/WhatIfPage';
import DecisionsPage from './components/pages/DecisionsPage';
import DataQualityPage from './components/pages/DataQualityPage';

function AppContent() {
  const { isAuthenticated, isLoading, logout, can } = useAuth();
  
  // Routing state
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => (isAuthenticated ? 'app' : 'landing'));
  const [currentPage, setCurrentPage] = useState<PageId>('command-center');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Baseline record from synthetic data
  const baselineRecord = useMemo(() => getLatestRecord(syntheticData), []);

  // User-editable simulation inputs - SOURCE OF TRUTH for all calculations
  const [inputs, setInputs] = useState<SimulationInputs>(() => inputsFromRecord(baselineRecord));

  // What-If parameters
  const [whatIfParams, setWhatIfParams] = useState<WhatIfParams>({
    additionalBeds: 0,
    additionalNurses: 0,
    additionalDoctors: 0,
    patientSurgePercent: 0,
  });

  const [inputChangeExplanation, setInputChangeExplanation] = useState<string | null>(null);

  // Derive effective EDRecord from user inputs - feeds all engines
  const currentRecord = useMemo(
    () => applyInputsToRecord(baselineRecord, inputs),
    [baselineRecord, inputs]
  );

  const scenarioStr = inputs.scenario === 'outbreak' || inputs.scenario === 'custom' ? 'normal' : inputs.scenario;

  // === FULL CALCULATION PIPELINE ===
  const forecast = useMemo(
    () => generateForecast(syntheticData, currentRecord, scenarioStr),
    [currentRecord, scenarioStr]
  );

  const pressure = useMemo(
    () => calculatePressure(currentRecord, forecast.forecasts),
    [currentRecord, forecast]
  );

  const bottlenecks = useMemo(
    () => analyzeBottlenecks(currentRecord, forecast.forecasts),
    [currentRecord, forecast]
  );

  const recommendations = useMemo(
    () => generateRecommendations(pressure, bottlenecks, currentRecord, forecast.forecasts),
    [pressure, bottlenecks, currentRecord, forecast]
  );

  const whatIfResult = useMemo(
    () => runWhatIfSimulation(currentRecord, forecast.forecasts, pressure, bottlenecks, whatIfParams),
    [currentRecord, forecast, pressure, bottlenecks, whatIfParams]
  );

  const recentData = useMemo(() => getRecentRecords(syntheticData, 24), []);
  const dataQualityReport = useMemo(() => assessDataQuality(syntheticData), []);

  // Handlers
  const handleInputsChange = useCallback((newInputs: SimulationInputs) => {
    const changes: string[] = [];
    if (newInputs.arrivalsPerHour !== inputs.arrivalsPerHour) {
      changes.push(`Arrivals adjusted from ${inputs.arrivalsPerHour} to ${newInputs.arrivalsPerHour}/hr`);
    }
    if (newInputs.currentOccupancy !== inputs.currentOccupancy) {
      changes.push(`Occupancy adjusted from ${inputs.currentOccupancy} to ${newInputs.currentOccupancy}`);
    }
    if (newInputs.availableBeds !== inputs.availableBeds) {
      changes.push(`Available beds adjusted from ${inputs.availableBeds} to ${newInputs.availableBeds}`);
    }
    if (newInputs.nursesAvailable !== inputs.nursesAvailable) {
      changes.push(`Nurses adjusted from ${inputs.nursesAvailable} to ${newInputs.nursesAvailable}`);
    }
    if (newInputs.doctorsAvailable !== inputs.doctorsAvailable) {
      changes.push(`Physicians adjusted from ${inputs.doctorsAvailable} to ${newInputs.doctorsAvailable}`);
    }
    if (newInputs.surgeMult !== inputs.surgeMult) {
      changes.push(`Surge multiplier adjusted to ${newInputs.surgeMult}x`);
    }
    if (newInputs.waitingPatients !== inputs.waitingPatients) {
      changes.push(`Waiting queue adjusted from ${inputs.waitingPatients} to ${newInputs.waitingPatients}`);
    }

    setInputs(newInputs);
    if (changes.length > 0) {
      setInputChangeExplanation(changes.join('. ') + '. Downstream analytical engines recalculated.');
    }
  }, [inputs]);

  const handleSelectScenario = useCallback((scenario: SimulationInputs['scenario']) => {
    const baseInputs = inputsFromRecord(baselineRecord);
    const newInputs = applyScenario(baseInputs, scenario);
    setInputs(newInputs);
    setInputChangeExplanation(`Scenario switched to "${scenario}". Downstream forecast recomputed.`);
    setWhatIfParams({ additionalBeds: 0, additionalNurses: 0, additionalDoctors: 0, patientSurgePercent: 0 });
  }, [baselineRecord]);

  const handleReset = useCallback(() => {
    setInputs(inputsFromRecord(baselineRecord));
    setWhatIfParams({ additionalBeds: 0, additionalNurses: 0, additionalDoctors: 0, patientSurgePercent: 0 });
    setInputChangeExplanation(null);
  }, [baselineRecord]);

  const handleSimulateAction = useCallback(() => {
    const bedGap = bottlenecks.primary.gap;
    const nurseGap = bottlenecks.all.find(b => b.resource === 'nurses')?.gap ?? 0;
    const doctorGap = bottlenecks.all.find(b => b.resource === 'doctors')?.gap ?? 0;
    setWhatIfParams({
      additionalBeds: bedGap < 0 ? Math.abs(bedGap) : 0,
      additionalNurses: nurseGap < 0 ? Math.abs(nurseGap) : 0,
      additionalDoctors: doctorGap < 0 ? Math.abs(doctorGap) : 0,
      patientSurgePercent: 0,
    });
    setCurrentPage('what-if');
  }, [bottlenecks]);

  const handleNavigateAppPage = useCallback((page: string) => {
    // If navigation targets an admin page and user is not admin, handle cleanly
    if (page === 'administration' && !can('manage_users')) {
      setCurrentRoute('access-denied');
      return;
    }
    setCurrentPage(page as PageId);
  }, [can]);

  const handleSignOut = useCallback(async () => {
    await logout();
    setCurrentRoute('landing');
  }, [logout]);

  // Route Dispatcher
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-xs text-[#727272]">
        Loading AgraVeda Operations Environment...
      </div>
    );
  }

  // 1. Landing Page
  if (currentRoute === 'landing') {
    return (
      <LandingPage
        onNavigate={(route) => setCurrentRoute(route as AppRoute)}
        onExploreDemo={() => {
          // If already signed in, enter app; else go to login
          if (isAuthenticated) {
            setCurrentRoute('app');
          } else {
            setCurrentRoute('login');
          }
        }}
      />
    );
  }

  // 2. Auth Routes
  if (currentRoute === 'login') {
    return <LoginPage onNavigate={(route) => setCurrentRoute(route as AppRoute)} />;
  }
  if (currentRoute === 'signup') {
    return <SignupPage onNavigate={(route) => setCurrentRoute(route as AppRoute)} />;
  }
  if (currentRoute === 'forgot-password') {
    return <ForgotPasswordPage onNavigate={(route) => setCurrentRoute(route as AppRoute)} />;
  }
  if (currentRoute === 'access-denied') {
    return (
      <AccessDeniedPage
        onNavigate={(route) => {
          if (route === 'app') setCurrentRoute('app');
          else setCurrentRoute(route as AppRoute);
        }}
        requiredCapability="Staff Administration"
      />
    );
  }

  // 3. Protected Application Shell (requires authentication)
  if (!isAuthenticated) {
    return <LoginPage onNavigate={(route) => setCurrentRoute(route as AppRoute)} />;
  }

  const renderActiveModule = () => {
    switch (currentPage) {
      case 'command-center':
        return (
          <CommandCenter
            currentRecord={currentRecord}
            forecast={forecast}
            pressure={pressure}
            bottlenecks={bottlenecks}
            recommendations={recommendations}
            recentData={recentData}
            scenario={scenarioStr}
            onNavigate={handleNavigateAppPage}
          />
        );
      case 'forecast-inputs':
        return (
          <ForecastInputs
            inputs={inputs}
            onInputsChange={handleInputsChange}
            forecast={forecast}
            currentRecord={currentRecord}
            recentData={recentData}
            scenario={scenarioStr}
            onRunForecast={() => {}}
            onReset={handleReset}
            inputChangeExplanation={inputChangeExplanation}
          />
        );
      case 'patient-flow':
        return (
          <PatientFlowPage
            currentRecord={currentRecord}
            bottlenecks={bottlenecks}
            forecast={forecast}
          />
        );
      case 'resources':
        return (
          <ResourcesPage
            bottlenecks={bottlenecks}
            currentRecord={currentRecord}
            forecast={forecast}
          />
        );
      case 'scenarios':
        return (
          <ScenariosPage
            currentScenario={inputs.scenario}
            onSelectScenario={handleSelectScenario}
            pressure={pressure}
            bottlenecks={bottlenecks}
            forecast={forecast}
          />
        );
      case 'what-if':
        return (
          <WhatIfPage
            params={whatIfParams}
            onParamsChange={setWhatIfParams}
            result={whatIfResult}
            onReset={() =>
              setWhatIfParams({
                additionalBeds: 0,
                additionalNurses: 0,
                additionalDoctors: 0,
                patientSurgePercent: 0,
              })
            }
          />
        );
      case 'decisions':
        return (
          <DecisionsPage
            recommendations={recommendations}
            pressure={pressure}
            bottlenecks={bottlenecks}
            whatIfResult={whatIfResult}
            onSimulateAction={handleSimulateAction}
            onNavigate={handleNavigateAppPage}
          />
        );
      case 'data-quality':
        return <DataQualityPage report={dataQualityReport} forecast={forecast} />;
      case 'administration':
        return <AdminPage />;
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={currentPage}
        onNavigate={(p) => setCurrentPage(p)}
        pressureLevel={pressure.level}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        onSignOut={handleSignOut}
      />
      <main className={`app-main ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[252px]'}`}>
        <DemoModeBanner />
        <Topbar
          onSignOut={handleSignOut}
          onNavigateHome={() => setCurrentRoute('landing')}
        />
        <div className="app-content">{renderActiveModule()}</div>
        <footer className="py-4 text-center text-[10px] text-[#727272] border-t border-[#EAEAEA] bg-white">
          AgraVeda Operations Systems · Structured synthetic dataset · Operational decision support prototype · Clinical teams retain sole patient diagnosis and care authority
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
