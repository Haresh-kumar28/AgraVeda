import React from 'react';
import { SimulationInputs, INPUT_EXPLANATIONS } from '../../types';
import { ForecastResult } from '../../engines/forecastEngine';
import { EDRecord } from '../../data/syntheticData';
import ForecastChart from '../ForecastChart';
import { Settings2, RefreshCw, Info, Lock } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

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

const InputGroup: React.FC<{
  label: string;
  field: keyof SimulationInputs;
  value: number | boolean;
  onChange: (val: any) => void;
  min?: number;
  max?: number;
  step?: number;
  isToggle?: boolean;
  disabled?: boolean;
}> = ({ label, field, value, onChange, min, max, step, isToggle, disabled }) => (
  <div className="p-3 bg-white border border-[#EAEAEA] rounded space-y-2">
    <div className="flex justify-between items-center">
      <label htmlFor={`input-${field}`} className="text-xs font-semibold text-[#222222]">
        {label}
      </label>
      {isToggle ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(!value)}
          className={`px-2.5 py-1 text-xs rounded font-semibold transition-colors ${
            value
              ? 'bg-[#1B74E4] text-white'
              : 'bg-[#F8F9FA] text-[#727272] border border-[#EAEAEA]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {value ? 'Weekend' : 'Weekday'}
        </button>
      ) : (
        <input
          id={`input-${field}`}
          type="number"
          disabled={disabled}
          value={value as number}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-20 bg-[#F8F9FA] border border-[#EAEAEA] text-[#222222] rounded px-2 py-1 text-xs text-right font-mono focus:border-[#1B74E4] focus:outline-none disabled:opacity-50"
          min={min}
          max={max}
          step={step}
        />
      )}
    </div>

    {!isToggle && max !== undefined && (
      <input
        type="range"
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        value={value as number}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full accent-[#1B74E4] h-1.5 bg-[#F8F9FA] rounded appearance-none cursor-pointer disabled:opacity-50"
      />
    )}

    <p className="text-[10px] text-[#727272] leading-tight">
      {INPUT_EXPLANATIONS[field as string] || ''}
    </p>
  </div>
);

export const ForecastInputs: React.FC<ForecastInputsProps> = ({
  inputs,
  onInputsChange,
  forecast,
  currentRecord: _currentRecord,
  recentData,
  scenario,
  onRunForecast: _onRunForecast,
  onReset,
  inputChangeExplanation,
}) => {
  const { can } = useAuth();
  const canEdit = can('edit_simulation_inputs');

  const updateInput = (field: keyof SimulationInputs, value: any) => {
    if (!canEdit) return;
    onInputsChange({ ...inputs, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
        <div>
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-[#1B74E4]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#222222]">
              Forecast & Operational Inputs
            </h1>
          </div>
          <p className="text-xs text-[#727272] mt-1">
            Editable parameters driving the downstream analytical engines with recalculation provenance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!canEdit && (
            <span className="text-xs text-[#B54708] bg-[#FFFAEB] border border-[#FEDF89] px-2.5 py-1 rounded flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Read-Only Role Lens</span>
            </span>
          )}
          {canEdit && (
            <button
              onClick={onReset}
              className="h-8 px-3 rounded bg-white border border-[#EAEAEA] hover:bg-[#F8F9FA] text-xs font-semibold text-[#222222] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Baseline</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Parameters (4 cols) */}
        <div className="lg:col-span-4 p-5 bg-white border border-[#EAEAEA] rounded-md space-y-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#222222] mb-3">
              Patient Demand Parameters
            </h2>
            <div className="space-y-3">
              <InputGroup
                label="Arrivals per Hour"
                field="arrivalsPerHour"
                value={inputs.arrivalsPerHour}
                onChange={(v) => updateInput('arrivalsPerHour', v)}
                min={0}
                max={50}
                disabled={!canEdit}
              />
              <InputGroup
                label="Surge Multiplier"
                field="surgeMult"
                value={inputs.surgeMult}
                onChange={(v) => updateInput('surgeMult', v)}
                min={0.5}
                max={3.0}
                step={0.1}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#222222] mb-3">
              Current Floor State
            </h2>
            <div className="space-y-3">
              <InputGroup
                label="Current Occupancy"
                field="currentOccupancy"
                value={inputs.currentOccupancy}
                onChange={(v) => updateInput('currentOccupancy', v)}
                min={0}
                max={inputs.totalBeds}
                disabled={!canEdit}
              />
              <InputGroup
                label="Waiting Queue Depth"
                field="waitingPatients"
                value={inputs.waitingPatients}
                onChange={(v) => updateInput('waitingPatients', v)}
                min={0}
                max={60}
                disabled={!canEdit}
              />
              <InputGroup
                label="Departures / Discharges"
                field="departures"
                value={inputs.departures}
                onChange={(v) => updateInput('departures', v)}
                min={0}
                max={40}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#222222] mb-3">
              Staffing & Bed Capacity
            </h2>
            <div className="space-y-3">
              <InputGroup
                label="Available Treatment Beds"
                field="availableBeds"
                value={inputs.availableBeds}
                onChange={(v) => updateInput('availableBeds', v)}
                min={0}
                max={inputs.totalBeds}
                disabled={!canEdit}
              />
              <InputGroup
                label="Nurses on Floor"
                field="nursesAvailable"
                value={inputs.nursesAvailable}
                onChange={(v) => updateInput('nursesAvailable', v)}
                min={1}
                max={30}
                disabled={!canEdit}
              />
              <InputGroup
                label="Attending Physicians"
                field="doctorsAvailable"
                value={inputs.doctorsAvailable}
                onChange={(v) => updateInput('doctorsAvailable', v)}
                min={1}
                max={15}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#222222] mb-3">
              Temporal Cycle
            </h2>
            <div className="space-y-3">
              <InputGroup
                label="Hour of Day"
                field="hour"
                value={inputs.hour}
                onChange={(v) => updateInput('hour', v)}
                min={0}
                max={23}
                disabled={!canEdit}
              />
              <InputGroup
                label="Day Type"
                field="isWeekend"
                value={inputs.isWeekend}
                onChange={(v) => updateInput('isWeekend', v)}
                isToggle={true}
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>

        {/* Right: Calculated Forecast & Recalculation Impact (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-5 bg-white border border-[#EAEAEA] rounded-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#222222]">
                  Recalculated Demand Forecast
                </h2>
                <p className="text-xs text-[#727272] mt-0.5">
                  Analytical pipeline runs automatically upon parameter modification.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#727272]">
                <span>MAE: <strong className="text-[#222222]">{forecast.metrics.mae.toFixed(2)}</strong></span>
                <span>RMSE: <strong className="text-[#222222]">{forecast.metrics.rmse.toFixed(2)}</strong></span>
              </div>
            </div>

            <ForecastChart forecast={forecast} recentData={recentData} scenario={scenario} />
          </div>

          {inputChangeExplanation && (
            <div className="p-4 bg-[#EAF4FF] border border-[#B2DDFF] rounded-md flex items-start gap-3">
              <Info className="w-5 h-5 text-[#1B74E4] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-[#175CD3]">
                  Recalculation Provenance Notice
                </h3>
                <p className="text-xs text-[#1558B0] mt-0.5 leading-relaxed">
                  {inputChangeExplanation}
                </p>
              </div>
            </div>
          )}

          {/* Table of Active Inputs */}
          <div className="bg-white border border-[#EAEAEA] rounded-md overflow-hidden">
            <div className="p-4 border-b border-[#EAEAEA]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">
                Current Engine Input Summary
              </h3>
            </div>
            <table className="w-full text-xs text-left text-[#222222]">
              <thead className="bg-[#F8F9FA] text-[10px] font-bold uppercase text-[#727272] border-b border-[#EAEAEA]">
                <tr>
                  <th className="px-4 py-3">Parameter</th>
                  <th className="px-4 py-3">Active Value</th>
                  <th className="px-4 py-3">Analytical Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {[
                  { key: 'arrivalsPerHour', label: 'Arrivals / Hr' },
                  { key: 'surgeMult', label: 'Surge Multiplier' },
                  { key: 'currentOccupancy', label: 'Occupancy' },
                  { key: 'waitingPatients', label: 'Waiting Queue' },
                  { key: 'availableBeds', label: 'Available Beds' },
                  { key: 'nursesAvailable', label: 'Nurses on Duty' },
                  { key: 'doctorsAvailable', label: 'Physicians on Duty' },
                  { key: 'hour', label: 'Hour of Day' },
                ].map(({ key, label }) => (
                  <tr key={key} className="hover:bg-[#F8F9FA]">
                    <td className="px-4 py-3 font-semibold">{label}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#1B74E4]">
                      {String(inputs[key as keyof SimulationInputs])}
                    </td>
                    <td className="px-4 py-3 text-[#727272]">{INPUT_EXPLANATIONS[key] || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastInputs;
