import { EDRecord } from './data/syntheticData';

// All user-editable simulation inputs
export interface SimulationInputs {
  // Demand
  arrivalsPerHour: number;
  surgeMult: number; // 1.0 = normal

  // Current State
  currentOccupancy: number;
  waitingPatients: number;
  departures: number;

  // Capacity
  totalBeds: number;
  availableBeds: number;
  nursesAvailable: number;
  doctorsAvailable: number;
  diagnosticCapacity: number;

  // Temporal
  hour: number;
  dayOfWeek: number;
  isWeekend: boolean;

  // Scenario
  scenario: 'normal' | 'accident_surge' | 'weekend_peak' | 'outbreak' | 'custom';
}

export type PageId =
  | 'command-center'
  | 'forecast-inputs'
  | 'patient-flow'
  | 'resources'
  | 'scenarios'
  | 'what-if'
  | 'decisions'
  | 'data-quality';

/** Build SimulationInputs from an EDRecord baseline */
export function inputsFromRecord(record: EDRecord): SimulationInputs {
  return {
    arrivalsPerHour: record.arrivals,
    surgeMult: 1.0,
    currentOccupancy: record.currentOccupancy,
    waitingPatients: record.waitingPatients,
    departures: record.departures,
    totalBeds: record.totalBeds,
    availableBeds: record.availableBeds,
    nursesAvailable: record.nursesAvailable,
    doctorsAvailable: record.doctorsAvailable,
    diagnosticCapacity: 10,
    hour: record.hour,
    dayOfWeek: record.dayOfWeek,
    isWeekend: record.isWeekend,
    scenario: record.scenario === 'accident_surge' ? 'accident_surge'
            : record.scenario === 'weekend_peak' ? 'weekend_peak'
            : 'normal',
  };
}

/** Apply SimulationInputs overrides onto an EDRecord to produce a modified EDRecord for engines */
export function applyInputsToRecord(base: EDRecord, inputs: SimulationInputs): EDRecord {
  const effectiveArrivals = Math.round(inputs.arrivalsPerHour * inputs.surgeMult);
  return {
    ...base,
    arrivals: effectiveArrivals,
    currentOccupancy: inputs.currentOccupancy,
    waitingPatients: inputs.waitingPatients,
    departures: inputs.departures,
    totalBeds: inputs.totalBeds,
    availableBeds: inputs.availableBeds,
    nursesAvailable: inputs.nursesAvailable,
    doctorsAvailable: inputs.doctorsAvailable,
    diagnosticQueue: Math.round(effectiveArrivals * 0.3),
    averageWaitTime: Math.round(10 + (inputs.currentOccupancy / inputs.totalBeds) * 50 + inputs.waitingPatients * 1.5),
    hour: inputs.hour,
    dayOfWeek: inputs.dayOfWeek,
    isWeekend: inputs.isWeekend,
    highAcuity: Math.round(effectiveArrivals * 0.2),
    mediumAcuity: Math.round(effectiveArrivals * 0.45),
    lowAcuity: Math.round(effectiveArrivals * 0.35),
    scenario: inputs.scenario === 'outbreak' || inputs.scenario === 'custom' ? 'normal' : inputs.scenario,
  };
}

/** Apply a scenario preset to inputs */
export function applyScenario(baseInputs: SimulationInputs, scenario: SimulationInputs['scenario']): SimulationInputs {
  const i = { ...baseInputs, scenario };
  switch (scenario) {
    case 'accident_surge':
      i.surgeMult = 1.8;
      i.currentOccupancy = Math.min(i.totalBeds - 1, Math.round(i.currentOccupancy * 1.35));
      i.waitingPatients = Math.max(12, Math.round(i.waitingPatients * 2));
      i.availableBeds = Math.max(1, i.totalBeds - i.currentOccupancy);
      return i;
    case 'weekend_peak':
      i.surgeMult = 1.1;
      i.isWeekend = true;
      i.currentOccupancy = Math.min(i.totalBeds - 3, Math.round(i.currentOccupancy * 1.1));
      i.availableBeds = Math.max(3, i.totalBeds - Math.round(i.currentOccupancy * 0.85));
      return i;
    case 'outbreak':
      i.surgeMult = 1.5;
      i.currentOccupancy = Math.min(i.totalBeds - 2, Math.round(i.currentOccupancy * 1.25));
      i.waitingPatients = Math.max(10, Math.round(i.waitingPatients * 1.8));
      i.availableBeds = Math.max(2, i.totalBeds - i.currentOccupancy);
      return i;
    case 'custom':
      i.surgeMult = 1.0;
      return i;
    default: // normal
      i.surgeMult = 1.0;
      return i;
  }
}

export const INPUT_EXPLANATIONS: Record<string, string> = {
  arrivalsPerHour: 'Represents incoming ED demand and is the strongest direct signal of near-term workload.',
  surgeMult: 'Multiplier applied to arrivals to model external demand changes such as an accident or outbreak.',
  currentOccupancy: 'Determines how much capacity is already being consumed before new patients arrive.',
  waitingPatients: 'Indicates existing unmet demand and contributes to near-term flow pressure.',
  departures: 'Expected discharges per hour. Higher departures relieve occupancy pressure.',
  totalBeds: 'Total treatment-bed capacity in the ED. Determines the absolute capacity ceiling.',
  availableBeds: 'Determines whether predicted arrivals can be absorbed without exceeding treatment capacity.',
  nursesAvailable: 'Constrains how many patients can be safely processed through active care areas (1:4 ratio).',
  doctorsAvailable: 'Constrains initial assessment throughput (1:6 ratio).',
  diagnosticCapacity: 'Maximum concurrent diagnostic tests. Limits downstream flow when saturated.',
  hour: 'Captures recurring hourly patterns in emergency-department demand.',
  dayOfWeek: 'Captures day-of-week patterns. Weekdays differ from weekends.',
  isWeekend: 'Weekend vs. weekday flag. Weekend patterns tend to differ.',
  scenario: 'Represents an external demand condition such as an accident surge or outbreak.',
};
