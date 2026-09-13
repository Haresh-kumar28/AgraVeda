import { useState, useMemo, useCallback } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import './index.css';
import { syntheticData, getLatestRecord, getRecentRecords } from './data/syntheticData';
import { generateForecast } from './engines/forecastEngine';
import { calculatePressure } from './engines/pressureEngine';
import { analyzeBottlenecks } from './engines/bottleneckEngine';
import { generateRecommendations } from './engines/recommendationEngine';
import { runWhatIfSimulation, WhatIfParams } from './engines/whatIfSimulator';
import { assessDataQuality } from './engines/dataQualityEngine';
import { PageId, SimulationInputs, inputsFromRecord, applyInputsToRecord, applyScenario } from './types';

import Sidebar from './components/Sidebar';
import CommandCenter from './components/pages/CommandCenter';
import ForecastInputs from './components/pages/ForecastInputs';
import PatientFlowPage from './components/pages/PatientFlowPage';
import ResourcesPage from './components/pages/ResourcesPage';
import ScenariosPage from './components/pages/ScenariosPage';
import WhatIfPage from './components/pages/WhatIfPage';
import DecisionsPage from './components/pages/DecisionsPage';
import DataQualityPage from './components/pages/DataQualityPage';

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('command-center');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Baseline record from synthetic data
  const baselineRecord = useMemo(() => getLatestRecord(syntheticData), []);

  // User-editable simulation inputs - this is the SOURCE OF TRUTH for all calculations
  const [inputs, setInputs] = useState<SimulationInputs>(() => inputsFromRecord(baselineRecord));

  // What-If params (separate from main inputs)
  const [whatIfParams, setWhatIfParams] = useState<WhatIfParams>({
    additionalBeds: 0, additionalNurses: 0, additionalDoctors: 0, patientSurgePercent: 0,
  });

  // Track input change for explanation
  const [inputChangeExplanation, setInputChangeExplanation] = useState<string | null>(null);

  // Derive the effective EDRecord from user inputs - this feeds ALL engines
  const currentRecord = useMemo(
    () => applyInputsToRecord(baselineRecord, inputs),
    [baselineRecord, inputs]
  );

  // Scenario string for forecast engine
  const scenarioStr = inputs.scenario === 'outbreak' || inputs.scenario === 'custom' ? 'normal' : inputs.scenario;

  // === FULL CALCULATION PIPELINE — driven by user inputs ===
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

  // === HANDLERS ===
  const handleInputsChange = useCallback((newInputs: SimulationInputs) => {
    // Detect what changed and generate explanation
    const changes: string[] = [];
    if (newInputs.arrivalsPerHour !== inputs.arrivalsPerHour) {
      changes.push(`Arrivals changed from ${inputs.arrivalsPerHour}/hr to ${newInputs.arrivalsPerHour}/hr`);
    }
    if (newInputs.currentOccupancy !== inputs.currentOccupancy) {
      changes.push(`Occupancy changed from ${inputs.currentOccupancy} to ${newInputs.currentOccupancy}`);
    }
    if (newInputs.availableBeds !== inputs.availableBeds) {
      changes.push(`Available beds changed from ${inputs.availableBeds} to ${newInputs.availableBeds}`);
    }
    if (newInputs.nursesAvailable !== inputs.nursesAvailable) {
      changes.push(`Nurses changed from ${inputs.nursesAvailable} to ${newInputs.nursesAvailable}`);
    }
    if (newInputs.doctorsAvailable !== inputs.doctorsAvailable) {
      changes.push(`Doctors changed from ${inputs.doctorsAvailable} to ${newInputs.doctorsAvailable}`);
    }
    if (newInputs.surgeMult !== inputs.surgeMult) {
      changes.push(`Surge multiplier changed from ${inputs.surgeMult}x to ${newInputs.surgeMult}x`);
    }
    if (newInputs.waitingPatients !== inputs.waitingPatients) {
      changes.push(`Waiting patients changed from ${inputs.waitingPatients} to ${newInputs.waitingPatients}`);
    }

    setInputs(newInputs);

    if (changes.length > 0) {
      // We'll compute the explanation after the state updates via the next render
      setInputChangeExplanation(changes.join('. ') + '. All downstream calculations have been recalculated.');
    }
  }, [inputs]);

  const handleSelectScenario = useCallback((scenario: SimulationInputs['scenario']) => {
    const baseInputs = inputsFromRecord(baselineRecord);
    const newInputs = applyScenario(baseInputs, scenario);
    setInputs(newInputs);
    setInputChangeExplanation(`Scenario changed to "${scenario}". All inputs and forecasts updated.`);
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

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page as PageId);
  }, []);

  // === RENDER ===
  const renderPage = () => {
    switch (currentPage) {
      case 'command-center':
        return <CommandCenter currentRecord={currentRecord} forecast={forecast} pressure={pressure}
          bottlenecks={bottlenecks} recommendations={recommendations} recentData={recentData}
          scenario={scenarioStr} onNavigate={handleNavigate} />;
      case 'forecast-inputs':
        return <ForecastInputs inputs={inputs} onInputsChange={handleInputsChange} forecast={forecast}
          currentRecord={currentRecord} recentData={recentData} scenario={scenarioStr}
          onRunForecast={() => {}} onReset={handleReset} inputChangeExplanation={inputChangeExplanation} />;
      case 'patient-flow':
        return <PatientFlowPage currentRecord={currentRecord} bottlenecks={bottlenecks} forecast={forecast} />;
      case 'resources':
        return <ResourcesPage bottlenecks={bottlenecks} currentRecord={currentRecord} forecast={forecast} />;
      case 'scenarios':
        return <ScenariosPage currentScenario={inputs.scenario} onSelectScenario={handleSelectScenario}
          pressure={pressure} bottlenecks={bottlenecks} forecast={forecast} />;
      case 'what-if':
        return <WhatIfPage params={whatIfParams} onParamsChange={setWhatIfParams}
          result={whatIfResult} onReset={() => setWhatIfParams({ additionalBeds: 0, additionalNurses: 0, additionalDoctors: 0, patientSurgePercent: 0 })} />;
      case 'decisions':
        return <DecisionsPage recommendations={recommendations} pressure={pressure}
          bottlenecks={bottlenecks} whatIfResult={whatIfResult}
          onSimulateAction={handleSimulateAction} onNavigate={handleNavigate} />;
      case 'data-quality':
        return <DataQualityPage report={dataQualityReport} forecast={forecast} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        pressureLevel={pressure.level}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />
      <main className={`app-main ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[244px]'}`}>
        <header className="topbar">
          <div className="topbar-search"><Search className="w-4 h-4"/><input aria-label="Search" placeholder="Search EDPulse..." /></div>
          <div className="topbar-meta">
            <span className="hidden md:inline topbar-chip">System Operational</span>
            <button className="w-9 h-9 rounded-lg border border-slate-200 bg-white grid place-items-center text-slate-500 hover:bg-slate-50" aria-label="Notifications"><Bell className="w-4 h-4"/></button>
            <div className="user-chip"><span className="user-avatar">ED</span><span className="hidden sm:inline">ED Administrator</span><ChevronDown className="w-3.5 h-3.5 text-slate-400"/></div>
          </div>
        </header>
        <div className="app-content">
          {renderPage()}
        </div>
        <div className="text-center py-4 text-[10px] text-slate-400 border-t border-slate-200">EDPulse · Simulated demo data · Operational decision support only · Not a clinical tool</div>
      </main>
    </div>
  );
}

export default App;
