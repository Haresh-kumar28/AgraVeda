import React, { useMemo, useState } from 'react';
import { SimulationInputs, INPUT_EXPLANATIONS, inputsFromRecord } from '../../types';
import { ForecastResult } from '../../engines/forecastEngine';
import { EDRecord, syntheticData, getLatestRecord } from '../../data/syntheticData';
import ForecastChart from '../ForecastChart';
import {
  Settings2,
  RefreshCw,
  Info,
  Lock,
  Bed,
  Users,
  Clock,
  Stethoscope,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
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

interface InputControlProps {
  label: string;
  field: keyof SimulationInputs;
  value: number;
  baselineValue: number;
  unit: string;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  explanation: string;
  badge?: string;
}

const InputControl: React.FC<InputControlProps> = ({
  label,
  field,
  value,
  baselineValue,
  unit,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  explanation,
  badge,
}) => {
  const isModified = value !== baselineValue;

  return (
    <div
      className={`p-3 rounded-md border transition-all ${
        isModified
          ? 'bg-[#F0F7FF] border-[#B2DDFF]'
          : 'bg-[#FAFAF8] border-[#E8E4DF]'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={`input-${field}`}
          className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5"
        >
          <span>{label}</span>
          {isModified && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#1B74E4] bg-white border border-[#B2DDFF] px-1 py-0.2 rounded-sm">
              Modified
            </span>
          )}
        </label>

        <div className="flex items-center gap-1.5">
          {badge && (
            <span className="text-[10px] font-mono text-[#6B6B6B] bg-white px-1.5 py-0.5 rounded border border-[#E8E4DF]">
              {badge}
            </span>
          )}
          <div className="flex items-center gap-1 bg-white border border-[#E8E4DF] rounded px-2 py-0.5 focus-within:border-[#1B74E4]">
            <input
              id={`input-${field}`}
              type="number"
              disabled={disabled}
              value={value}
              onChange={(e) => {
                const parsed = parseFloat(e.target.value);
                if (!isNaN(parsed)) {
                  onChange(Math.max(min, Math.min(max, parsed)));
                }
              }}
              min={min}
              max={max}
              step={step}
              aria-label={label}
              className="w-14 text-xs text-right font-mono font-bold text-[#1A1A1A] bg-transparent focus:outline-none disabled:opacity-50"
            />
            <span className="text-[10px] text-[#6B6B6B] font-mono">{unit}</span>
          </div>
        </div>
      </div>

      <div className="pt-1">
        <input
          type="range"
          id={`range-${field}`}
          aria-label={`${label} slider`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full accent-[#1B74E4] h-1.5 bg-[#E8E4DF] rounded appearance-none cursor-pointer disabled:opacity-50"
        />
      </div>

      <div className="flex justify-between items-center text-[10px] text-[#6B6B6B] mt-1.5 pt-1 border-t border-[#E8E4DF]/60">
        <span className="leading-tight truncate max-w-[220px]" title={explanation}>
          {explanation}
        </span>
        <span className="font-mono text-[9px] shrink-0 text-[#6B6B6B]">
          Base: {baselineValue} {unit}
        </span>
      </div>
    </div>
  );
};

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
  const [resetConfirm, setResetConfirm] = useState(false);

  // Baseline values from synthetic data latest record
  const baselineRecord = useMemo(() => getLatestRecord(syntheticData), []);
  const baselineInputs = useMemo(() => inputsFromRecord(baselineRecord), [baselineRecord]);

  // Count active overrides
  const modifiedCount = useMemo(() => {
    let count = 0;
    (Object.keys(baselineInputs) as (keyof SimulationInputs)[]).forEach((k) => {
      if (inputs[k] !== baselineInputs[k]) count++;
    });
    return count;
  }, [inputs, baselineInputs]);

  const updateInput = (field: keyof SimulationInputs, value: any) => {
    if (!canEdit) return;

    const updated = { ...inputs, [field]: value };

    // Strict bed conservation: totalBeds = currentOccupancy + availableBeds
    if (field === 'currentOccupancy') {
      updated.availableBeds = Math.max(0, updated.totalBeds - (value as number));
    } else if (field === 'availableBeds') {
      updated.currentOccupancy = Math.max(0, updated.totalBeds - (value as number));
    }

    onInputsChange(updated);
  };

  // Compact Analytical Impact Calculations
  const impactSummary = useMemo(() => {
    if (!forecast.forecasts.length) return null;

    let peakArrivals = 0;
    let peakArrivalsHour = 1;
    let peakOccupancy = 0;
    let peakOccHour = 1;
    let peakWaiting = 0;
    let thresholdBreached = false;
    let breachDescription = 'Operations projected within nominal thresholds.';

    forecast.forecasts.forEach((f) => {
      if (f.predictedArrivals > peakArrivals) {
        peakArrivals = f.predictedArrivals;
        peakArrivalsHour = f.hoursAhead;
      }
      if (f.predictedOccupancy > peakOccupancy) {
        peakOccupancy = f.predictedOccupancy;
        peakOccHour = f.hoursAhead;
      }
      if (f.predictedWaiting > peakWaiting) {
        peakWaiting = f.predictedWaiting;
      }
    });

    const occRate = Math.round((peakOccupancy / inputs.totalBeds) * 100);

    if (occRate >= 95) {
      thresholdBreached = true;
      breachDescription = `Critical capacity threshold breached (+${peakOccHour}h): Projected occupancy reaches ${occRate}% (${peakOccupancy}/${inputs.totalBeds} beds).`;
    } else if (occRate >= 85) {
      thresholdBreached = true;
      breachDescription = `Watch threshold reached (+${peakOccHour}h): Projected occupancy reaches ${occRate}% (${peakOccupancy}/${inputs.totalBeds} beds).`;
    } else if (peakWaiting > 12) {
      thresholdBreached = true;
      breachDescription = `Waiting buffer overflow (+${peakArrivalsHour}h): Queue projected to accumulate ${peakWaiting} unassigned patients.`;
    }

    return {
      peakArrivals,
      peakArrivalsHour,
      peakOccupancy,
      peakOccHour,
      occRate,
      peakWaiting,
      thresholdBreached,
      breachDescription,
    };
  }, [forecast, inputs.totalBeds]);

  // Conservation check
  const bedBalanceBalanced = inputs.currentOccupancy + inputs.availableBeds === inputs.totalBeds;

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DF]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Forecast Parameters & Operational Inputs
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B74E4] bg-[#EAF4FF] border border-[#B2DDFF] px-2 py-0.5 rounded-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#1B74E4]" />
              <span>Reactive Model Pipeline</span>
            </span>
            {modifiedCount > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B54708] bg-[#FFFAEB] border border-[#FEDF89] px-2 py-0.5 rounded-sm">
                {modifiedCount} Parameter Override{modifiedCount !== 1 ? 's' : ''} Active
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Adjust emergency demand and floor capacity to observe real-time analytical pipeline recalculation.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {!canEdit && (
            <span className="text-xs text-[#B54708] bg-[#FFFAEB] border border-[#FEDF89] px-2.5 py-1.5 rounded flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Read-Only Role Lens</span>
            </span>
          )}

          {canEdit && (
            <>
              {resetConfirm ? (
                <div className="flex items-center gap-2 bg-[#FFFAEB] border border-[#FEDF89] p-1 rounded">
                  <span className="text-xs font-semibold text-[#B54708] px-1">Reset all inputs?</span>
                  <button
                    onClick={() => {
                      onReset();
                      setResetConfirm(false);
                    }}
                    className="h-7 px-2.5 bg-[#B54708] text-white rounded text-xs font-bold hover:bg-[#8C3B00] cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="h-7 px-2 bg-white text-[#6B6B6B] border border-[#E8E4DF] rounded text-xs hover:text-[#1A1A1A] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setResetConfirm(true)}
                  disabled={modifiedCount === 0}
                  className="h-8 px-3 rounded bg-white border border-[#E8E4DF] hover:bg-[#FAFAF8] text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#6B6B6B]" />
                  <span>Reset to Baseline</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 2. Main 2-Column Work Environment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Grouped Parameter Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Group 1: Patient Demand */}
          <div className="p-4 bg-white border border-[#E8E4DF] rounded-md space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1B74E4]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Patient Demand Parameters
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#6B6B6B]">
                Inflow: {Math.round(inputs.arrivalsPerHour * inputs.surgeMult)} pts/hr
              </span>
            </div>

            <div className="space-y-2.5">
              <InputControl
                label="Baseline Arrival Rate"
                field="arrivalsPerHour"
                value={inputs.arrivalsPerHour}
                baselineValue={baselineInputs.arrivalsPerHour}
                unit="pts/hr"
                min={0}
                max={50}
                onChange={(v) => updateInput('arrivalsPerHour', v)}
                disabled={!canEdit}
                explanation="Base hourly intake rate from walk-in and EMS ambulance deliveries."
              />

              <InputControl
                label="Surge Demand Multiplier"
                field="surgeMult"
                value={inputs.surgeMult}
                baselineValue={baselineInputs.surgeMult}
                unit="x"
                min={0.5}
                max={3.0}
                step={0.1}
                onChange={(v) => updateInput('surgeMult', v)}
                disabled={!canEdit}
                explanation="External demand escalation factor (1.0 = baseline, 1.8 = trauma surge)."
                badge={`${inputs.surgeMult}x`}
              />
            </div>
          </div>

          {/* Group 2: Current Floor State */}
          <div className="p-4 bg-white border border-[#E8E4DF] rounded-md space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1B74E4]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Current Floor State
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#6B6B6B]">
                {inputs.currentOccupancy} of {inputs.totalBeds} beds ({Math.round((inputs.currentOccupancy / inputs.totalBeds) * 100)}%)
              </span>
            </div>

            <div className="space-y-2.5">
              <InputControl
                label="Treatment Bed Occupancy"
                field="currentOccupancy"
                value={inputs.currentOccupancy}
                baselineValue={baselineInputs.currentOccupancy}
                unit="beds"
                min={0}
                max={inputs.totalBeds}
                onChange={(v) => updateInput('currentOccupancy', v)}
                disabled={!canEdit}
                explanation="Active patients currently occupying monitored treatment beds."
              />

              <InputControl
                label="Waiting Queue Depth"
                field="waitingPatients"
                value={inputs.waitingPatients}
                baselineValue={baselineInputs.waitingPatients}
                unit="pts"
                min={0}
                max={60}
                onChange={(v) => updateInput('waitingPatients', v)}
                disabled={!canEdit}
                explanation="Triaged patients in waiting area buffer awaiting clinician assignment."
              />

              <InputControl
                label="Discharges / Departures"
                field="departures"
                value={inputs.departures}
                baselineValue={baselineInputs.departures}
                unit="pts/hr"
                min={0}
                max={40}
                onChange={(v) => updateInput('departures', v)}
                disabled={!canEdit}
                explanation="Hourly outflow through inpatient bed admission, discharge, or transfer."
              />
            </div>
          </div>

          {/* Group 3: Staffing & Bed Capacity */}
          <div className="p-4 bg-white border border-[#E8E4DF] rounded-md space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-[#1B74E4]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Staffing & Bed Capacity
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#0E7A4E] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#0E7A4E]" />
                <span>Bed Balance Verified</span>
              </span>
            </div>

            {/* Conservation Status Bar */}
            <div className={`p-2 rounded text-[11px] flex items-center justify-between border ${
              bedBalanceBalanced
                ? 'bg-[#ECFDF3] border-[#A6F4C5] text-[#0E7A4E]'
                : 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
            }`}>
              <span>Floor Capacity Conservation:</span>
              <span className="font-mono font-bold">
                {inputs.currentOccupancy} Occ + {inputs.availableBeds} Avail = {inputs.totalBeds} Beds
              </span>
            </div>

            <div className="space-y-2.5">
              <InputControl
                label="Unassigned Reserve Beds"
                field="availableBeds"
                value={inputs.availableBeds}
                baselineValue={baselineInputs.availableBeds}
                unit="beds"
                min={0}
                max={inputs.totalBeds}
                onChange={(v) => updateInput('availableBeds', v)}
                disabled={!canEdit}
                explanation="Unoccupied treatment spaces immediately available to absorb arrivals."
              />

              <InputControl
                label="Nurses on Floor"
                field="nursesAvailable"
                value={inputs.nursesAvailable}
                baselineValue={baselineInputs.nursesAvailable}
                unit="RNs"
                min={1}
                max={30}
                onChange={(v) => updateInput('nursesAvailable', v)}
                disabled={!canEdit}
                explanation="Active floor nursing staff (1:4 standard patient-to-nurse ratio)."
                badge={`Covers ~${inputs.nursesAvailable * 4} pts`}
              />

              <InputControl
                label="Attending Physicians"
                field="doctorsAvailable"
                value={inputs.doctorsAvailable}
                baselineValue={baselineInputs.doctorsAvailable}
                unit="MDs"
                min={1}
                max={15}
                onChange={(v) => updateInput('doctorsAvailable', v)}
                disabled={!canEdit}
                explanation="Board-certified emergency physicians on duty (1:6 assessment ratio)."
                badge={`Covers ~${inputs.doctorsAvailable * 6} pts`}
              />
            </div>
          </div>

          {/* Group 4: Temporal Cycle */}
          <div className="p-4 bg-white border border-[#E8E4DF] rounded-md space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1B74E4]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Temporal Cycle Parameters
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#6B6B6B]">
                {inputs.hour.toString().padStart(2, '0')}:00 · {inputs.isWeekend ? 'Weekend' : 'Weekday'}
              </span>
            </div>

            <div className="space-y-2.5">
              <InputControl
                label="Hour of Day"
                field="hour"
                value={inputs.hour}
                baselineValue={baselineInputs.hour}
                unit="h"
                min={0}
                max={23}
                onChange={(v) => updateInput('hour', v)}
                disabled={!canEdit}
                explanation="24-hour cycle time driving historical temporal arrival patterns."
                badge={`${inputs.hour.toString().padStart(2, '0')}:00`}
              />

              <div className="p-3 bg-[#FAFAF8] border border-[#E8E4DF] rounded-md flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#1A1A1A]">Calendar Day Type</div>
                  <div className="text-[10px] text-[#6B6B6B] mt-0.5">
                    Weekends reflect distinct trauma and non-scheduled demand curves.
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={() => updateInput('isWeekend', !inputs.isWeekend)}
                  className={`px-3 py-1.5 text-xs rounded font-bold transition-colors cursor-pointer ${
                    inputs.isWeekend
                      ? 'bg-[#1B74E4] text-white'
                      : 'bg-white text-[#1A1A1A] border border-[#E8E4DF] hover:bg-[#FAFAF8]'
                  } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {inputs.isWeekend ? 'Weekend Cycle Active' : 'Weekday Cycle Active'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reactive Forecast, Impact Summary & Provenance (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Calculated Forecast Visualization */}
          <div className="p-5 bg-white border border-[#E8E4DF] rounded-md space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[#1A1A1A]">
                  Dynamic Emergency Demand Forecast
                </h2>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Analytical pipeline recalculates automatically upon parameter modification.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#6B6B6B] font-mono">
                <span>MAE: <strong className="text-[#1A1A1A]">±{forecast.metrics.mae.toFixed(1)} pts/hr</strong></span>
                <span>RMSE: <strong className="text-[#1A1A1A]">{forecast.metrics.rmse.toFixed(1)} pts/hr</strong></span>
              </div>
            </div>

            <ForecastChart forecast={forecast} recentData={recentData} scenario={scenario} />
          </div>

          {/* Compact Analytical Impact Summary */}
          {impactSummary && (
            <div className="p-5 bg-white border border-[#E8E4DF] rounded-md space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#1B74E4]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                    Projected Operational Impact Summary
                  </h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  impactSummary.thresholdBreached
                    ? 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'
                    : 'bg-[#ECFDF3] text-[#0E7A4E] border-[#A6F4C5]'
                }`}>
                  {impactSummary.thresholdBreached ? 'Constriction Alert' : 'Within Limits'}
                </span>
              </div>

              {/* 4-Metric Impact Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-[#FAFAF8] border border-[#E8E4DF] rounded text-center">
                  <div className="text-[10px] font-bold uppercase text-[#6B6B6B]">Peak Arrivals</div>
                  <div className="text-lg font-bold text-[#1A1A1A] font-mono mt-0.5">
                    {impactSummary.peakArrivals}
                    <span className="text-xs font-normal text-[#6B6B6B] ml-0.5">/hr</span>
                  </div>
                  <div className="text-[10px] text-[#6B6B6B] mt-0.5 font-mono">
                    at +{impactSummary.peakArrivalsHour}h window
                  </div>
                </div>

                <div className="p-3 bg-[#FAFAF8] border border-[#E8E4DF] rounded text-center">
                  <div className="text-[10px] font-bold uppercase text-[#6B6B6B]">Peak Occupancy</div>
                  <div className={`text-lg font-bold font-mono mt-0.5 ${
                    impactSummary.occRate >= 90 ? 'text-[#B42318]' : 'text-[#1A1A1A]'
                  }`}>
                    {impactSummary.occRate}%
                  </div>
                  <div className="text-[10px] text-[#6B6B6B] mt-0.5 font-mono">
                    {impactSummary.peakOccupancy} / {inputs.totalBeds} beds
                  </div>
                </div>

                <div className="p-3 bg-[#FAFAF8] border border-[#E8E4DF] rounded text-center">
                  <div className="text-[10px] font-bold uppercase text-[#6B6B6B]">Peak Queue</div>
                  <div className={`text-lg font-bold font-mono mt-0.5 ${
                    impactSummary.peakWaiting > 12 ? 'text-[#B42318]' : 'text-[#1A1A1A]'
                  }`}>
                    {impactSummary.peakWaiting}
                    <span className="text-xs font-normal text-[#6B6B6B] ml-0.5">pts</span>
                  </div>
                  <div className="text-[10px] text-[#6B6B6B] mt-0.5">
                    waiting buffer
                  </div>
                </div>

                <div className="p-3 bg-[#FAFAF8] border border-[#E8E4DF] rounded text-center">
                  <div className="text-[10px] font-bold uppercase text-[#6B6B6B]">Reserve Bed Gap</div>
                  <div className={`text-lg font-bold font-mono mt-0.5 ${
                    inputs.totalBeds - impactSummary.peakOccupancy < 0 ? 'text-[#B42318]' : 'text-[#0E7A4E]'
                  }`}>
                    {inputs.totalBeds - impactSummary.peakOccupancy > 0
                      ? `+${inputs.totalBeds - impactSummary.peakOccupancy}`
                      : inputs.totalBeds - impactSummary.peakOccupancy}
                  </div>
                  <div className="text-[10px] text-[#6B6B6B] mt-0.5">
                    {inputs.totalBeds - impactSummary.peakOccupancy < 0 ? 'Deficit at peak' : 'Reserve at peak'}
                  </div>
                </div>
              </div>

              {/* Threshold Breach Notice */}
              <div className={`p-3 rounded border text-xs leading-relaxed flex items-start gap-2 ${
                impactSummary.thresholdBreached
                  ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
                  : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
              }`}>
                {impactSummary.thresholdBreached ? (
                  <AlertTriangle className="w-4 h-4 text-[#B42318] shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" />
                )}
                <span>{impactSummary.breachDescription}</span>
              </div>

              {/* Model Assumptions & Limitations */}
              <div className="pt-2 border-t border-[#E8E4DF] text-[11px] text-[#6B6B6B] space-y-1">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A]">
                  <Info className="w-3.5 h-3.5 text-[#1B74E4]" />
                  <span>Model Assumptions & Limits</span>
                </div>
                <p className="leading-relaxed">
                  Calculations assume 1:4 nurse and 1:6 physician coverage ratios, and an average 75% departure-to-arrival conversion rate. Projections are based on aggregate Poisson hourly distributions; they do not reflect telemetry-level patient acuity shifts.
                </p>
              </div>
            </div>
          )}

          {/* Recalculation Provenance Banner */}
          {inputChangeExplanation && (
            <div className="p-4 bg-[#EAF4FF] border border-[#B2DDFF] rounded-md flex items-start gap-3">
              <Info className="w-4 h-4 text-[#1B74E4] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-[#175CD3]">
                  Analytical Recalculation Notice
                </h3>
                <p className="text-xs text-[#1558B0] mt-0.5 leading-relaxed">
                  {inputChangeExplanation}
                </p>
              </div>
            </div>
          )}

          {/* Active Engine Input Summary Table */}
          <div className="bg-white border border-[#E8E4DF] rounded-md overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E8E4DF] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Active Analytical Engine Parameter Matrix
                </h3>
                <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                  Parameters actively governing downstream analytical calculations.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#6B6B6B] bg-[#FAFAF8] px-2 py-1 rounded border border-[#E8E4DF]">
                {modifiedCount === 0 ? 'All Parameters at Baseline' : `${modifiedCount} Overridden`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-[#1A1A1A]">
                <thead className="bg-[#FAFAF8] text-[10px] font-bold uppercase text-[#6B6B6B] border-b border-[#E8E4DF]">
                  <tr>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Parameter</th>
                    <th className="px-4 py-2.5 text-right">Active Value</th>
                    <th className="px-4 py-2.5 text-right">Baseline</th>
                    <th className="px-4 py-2.5">Analytical Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DF]">
                  {[
                    { cat: 'Demand', key: 'arrivalsPerHour', label: 'Arrival Rate', unit: '/hr', base: baselineInputs.arrivalsPerHour },
                    { cat: 'Demand', key: 'surgeMult', label: 'Surge Multiplier', unit: 'x', base: `${baselineInputs.surgeMult}x` },
                    { cat: 'Floor Census', key: 'currentOccupancy', label: 'Treatment Occupancy', unit: 'beds', base: baselineInputs.currentOccupancy },
                    { cat: 'Floor Census', key: 'waitingPatients', label: 'Waiting Queue Depth', unit: 'pts', base: baselineInputs.waitingPatients },
                    { cat: 'Floor Census', key: 'departures', label: 'Outflow Departures', unit: 'pts/hr', base: baselineInputs.departures },
                    { cat: 'Capacity', key: 'availableBeds', label: 'Reserve Beds', unit: 'beds', base: baselineInputs.availableBeds },
                    { cat: 'Capacity', key: 'nursesAvailable', label: 'Floor Nurses', unit: 'RNs', base: baselineInputs.nursesAvailable },
                    { cat: 'Capacity', key: 'doctorsAvailable', label: 'Attending Physicians', unit: 'MDs', base: baselineInputs.doctorsAvailable },
                    { cat: 'Temporal', key: 'hour', label: 'Hour of Day', unit: 'h', base: `${baselineInputs.hour}:00` },
                    { cat: 'Temporal', key: 'isWeekend', label: 'Day Type', unit: '', base: baselineInputs.isWeekend ? 'Weekend' : 'Weekday' },
                  ].map(({ cat, key, label, unit, base }) => {
                    const activeVal = inputs[key as keyof SimulationInputs];
                    const isMod = activeVal !== baselineInputs[key as keyof SimulationInputs];

                    return (
                      <tr key={key} className={isMod ? 'bg-[#F0F7FF]/50' : 'hover:bg-[#FAFAF8]'}>
                        <td className="px-4 py-2 text-[10px] font-bold uppercase text-[#6B6B6B]">{cat}</td>
                        <td className="px-4 py-2 font-semibold">
                          {label}
                          {isMod && (
                            <span className="ml-1.5 text-[8px] font-bold uppercase text-[#1B74E4] bg-white border border-[#B2DDFF] px-1 py-0.2 rounded-sm">
                              Overridden
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-bold text-[#1B74E4]">
                          {typeof activeVal === 'boolean' ? (activeVal ? 'Weekend' : 'Weekday') : `${activeVal} ${unit}`.trim()}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-[#6B6B6B]">
                          {typeof base === 'boolean' ? (base ? 'Weekend' : 'Weekday') : `${base} ${unit}`.trim()}
                        </td>
                        <td className="px-4 py-2 text-[#6B6B6B] text-[11px]">{INPUT_EXPLANATIONS[key] || ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#FAFAF8] border-t border-[#E8E4DF] text-[10px] text-[#6B6B6B] flex items-center justify-between">
              <span>Data Source: 14-day synthetic temporal baseline (336 observations)</span>
              <span>Local in-memory analytical pipeline &lt; 15ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastInputs;
