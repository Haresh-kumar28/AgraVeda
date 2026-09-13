import React from 'react';
import { SimulationInputs, INPUT_EXPLANATIONS } from '../../types';
import { ForecastResult } from '../../engines/forecastEngine';
import { EDRecord } from '../../data/syntheticData';
import ForecastChart from '../ForecastChart';
import { Settings2, RefreshCw, Play, Info } from 'lucide-react';

interface ForecastInputsProps {
  inputs: SimulationInputs;
  onInputsChange: (inputs: SimulationInputs) => void;
  forecast: ForecastResult;
  currentRecord: EDRecord;
  recentData: EDRecord[];
  scenario: string;
  onRunForecast: () => void;
  onReset: () => void;
  inputChangeExplanation: string | null;
}

const InputGroup: React.FC<{ label: string; field: keyof SimulationInputs; value: number | boolean; onChange: (val: any) => void; min?: number; max?: number; step?: number; isToggle?: boolean }> = ({ label, field, value, onChange, min, max, step, isToggle }) => (
  <div className="mb-4 bg-white/50 p-3 rounded-lg border border-slate-200">
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm font-medium text-slate-800">{label}</label>
      {isToggle ? (
        <button
          onClick={() => onChange(!value)}
          className={`px-3 py-1 text-xs rounded-full font-medium ${value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          {value ? 'YES' : 'NO'}
        </button>
      ) : (
        <input
          type="number"
          value={value as number}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-20 bg-slate-100 border border-slate-300 text-slate-900 rounded px-2 py-1 text-sm text-right"
          min={min} max={max} step={step}
        />
      )}
    </div>
    {!isToggle && max !== undefined && (
      <input
        type="range"
        min={min} max={max} step={step}
        value={value as number}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-indigo-500 mb-2 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
      />
    )}
    <p className="text-xs text-slate-500 mt-1">{INPUT_EXPLANATIONS[field as string] || ''}</p>
  </div>
);

const ForecastInputs: React.FC<ForecastInputsProps> = ({
  inputs,
  onInputsChange,
  forecast,
  currentRecord,
  recentData,
  scenario,
  onRunForecast,
  onReset,
  inputChangeExplanation
}) => {
  const updateInput = (field: keyof SimulationInputs, value: any) => {
    onInputsChange({ ...inputs, [field]: value });
  };

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <Settings2 className="w-6 h-6 mr-2 text-blue-600" />
          Forecast & Inputs
        </h1>
        <p className="text-slate-500 text-sm">What will happen and what inputs drive the prediction?</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Simulation Inputs */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 lg:col-span-1 h-fit flex flex-col gap-6">
          
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Demand</h3>
            <InputGroup label="Arrivals Per Hour" field="arrivalsPerHour" value={inputs.arrivalsPerHour} onChange={(v) => updateInput('arrivalsPerHour', v)} min={0} max={50} />
            <InputGroup label="Surge Multiplier" field="surgeMult" value={inputs.surgeMult} onChange={(v) => updateInput('surgeMult', v)} min={0.5} max={3.0} step={0.1} />
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Current State</h3>
            <InputGroup label="Current Occupancy" field="currentOccupancy" value={inputs.currentOccupancy} onChange={(v) => updateInput('currentOccupancy', v)} min={0} max={inputs.totalBeds} />
            <InputGroup label="Waiting Patients" field="waitingPatients" value={inputs.waitingPatients} onChange={(v) => updateInput('waitingPatients', v)} min={0} max={100} />
            <InputGroup label="Departures" field="departures" value={inputs.departures} onChange={(v) => updateInput('departures', v)} min={0} max={50} />
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Capacity</h3>
            <InputGroup label="Total Beds" field="totalBeds" value={inputs.totalBeds} onChange={(v) => updateInput('totalBeds', v)} min={10} max={200} />
            <InputGroup label="Available Beds" field="availableBeds" value={inputs.availableBeds} onChange={(v) => updateInput('availableBeds', v)} min={0} max={inputs.totalBeds} />
            <InputGroup label="Nurses Available" field="nursesAvailable" value={inputs.nursesAvailable} onChange={(v) => updateInput('nursesAvailable', v)} min={0} max={50} />
            <InputGroup label="Doctors Available" field="doctorsAvailable" value={inputs.doctorsAvailable} onChange={(v) => updateInput('doctorsAvailable', v)} min={0} max={20} />
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Temporal</h3>
            <InputGroup label="Hour of Day" field="hour" value={inputs.hour} onChange={(v) => updateInput('hour', v)} min={0} max={23} />
            <InputGroup label="Is Weekend" field="isWeekend" value={inputs.isWeekend} onChange={(v) => updateInput('isWeekend', v)} isToggle={true} />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 mt-2">
            <button
              onClick={onRunForecast}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex justify-center items-center transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Forecast
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-100 text-slate-600 rounded-lg font-medium flex justify-center items-center transition-colors border border-slate-300"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Forecast Output */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-lg font-medium text-slate-900 mb-4">Predicted Demand & Occupancy</h2>
            <ForecastChart forecast={forecast} recentData={recentData} scenario={scenario} />
            
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-500">
              <span>Model Performance (MAE): <strong className="text-slate-800">{forecast.metrics.mae.toFixed(2)}</strong></span>
              <span>RMSE: <strong className="text-slate-800">{forecast.metrics.rmse.toFixed(2)}</strong></span>
            </div>
          </div>

          {inputChangeExplanation && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start">
              <Info className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-700 mb-1">Input Impact</h4>
                <p className="text-sm text-blue-800/80">{inputChangeExplanation}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-4 overflow-hidden">
            <h3 className="text-md font-medium text-slate-900 mb-4">Prediction Inputs Used</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-700">
                <thead className="text-xs text-slate-500 bg-slate-100 uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Input</th>
                    <th className="px-4 py-3">Current Value</th>
                    <th className="px-4 py-3 rounded-tr-lg">Why It Matters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {[
                    { key: 'arrivalsPerHour', label: 'Arrivals / Hr' },
                    { key: 'currentOccupancy', label: 'Current Occupancy' },
                    { key: 'waitingPatients', label: 'Waiting Patients' },
                    { key: 'availableBeds', label: 'Available Beds' },
                    { key: 'nursesAvailable', label: 'Nurses Available' },
                    { key: 'hour', label: 'Hour' },
                    { key: 'scenario', label: 'Scenario' },
                  ].map(({ key, label }) => (
                    <tr key={key} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{label}</td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-800 border border-slate-300 font-mono">
                          {String(inputs[key as keyof SimulationInputs])}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{INPUT_EXPLANATIONS[key] || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastInputs;
