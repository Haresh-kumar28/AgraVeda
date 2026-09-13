import { EDRecord } from '../data/syntheticData';
import { ForecastPoint } from './forecastEngine';

export type PressureLevel = 'NORMAL' | 'WATCH' | 'HIGH' | 'CRITICAL';

export interface PressureResult {
  level: PressureLevel;
  score: number; // 0-100
  description: string;
  timeToImpact: string; // e.g., 'within 2 hours'
  projectedOccupancy: number; // percentage
  factors: PressureFactor[];
}

export interface PressureFactor {
  name: string;
  value: number;
  threshold: number;
  status: 'ok' | 'warning' | 'critical';
}

export function calculatePressure(currentRecord: EDRecord, forecasts: ForecastPoint[]): PressureResult {
  const { totalBeds, currentOccupancy, waitingPatients, availableBeds, doctorsAvailable, nursesAvailable } = currentRecord;
  
  let projectedOccupancy = currentOccupancy;
  let timeToImpact = 'N/A';
  
  const forecast2h = forecasts.find(f => f.hoursAhead === 2);
  if (forecast2h) {
    projectedOccupancy = forecast2h.predictedOccupancy;
  }
  
  for (const f of forecasts) {
    if (f.predictedOccupancy / totalBeds > 0.85) {
      timeToImpact = `within ${f.hoursAhead} hours`;
      break;
    }
  }
  
  const occupancyScore = Math.min((currentOccupancy / totalBeds) * 30, 30);
  const projScore = Math.min((projectedOccupancy / totalBeds) * 25, 25);
  const waitScore = Math.min((waitingPatients / 15), 1) * 20;
  const bedScore = Math.min(Math.max(0, 1 - availableBeds / 8) * 15, 15);
  const staffScore = Math.min(Math.max(0, 1 - (doctorsAvailable + nursesAvailable) / 26) * 10, 10);
  
  const totalScore = occupancyScore + projScore + waitScore + bedScore + staffScore;
  
  let level: PressureLevel = 'NORMAL';
  let description = 'Operations within normal parameters';
  
  if (totalScore > 70) {
    level = 'CRITICAL';
    description = `Critical capacity constraints expected ${timeToImpact !== 'N/A' ? timeToImpact : 'soon'}. Immediate action recommended.`;
  } else if (totalScore > 50) {
    level = 'HIGH';
    description = `Significant pressure expected ${timeToImpact !== 'N/A' ? timeToImpact : 'soon'}. Prepare additional resources.`;
  } else if (totalScore > 30) {
    level = 'WATCH';
    description = 'Elevated activity detected. Monitor closely.';
  }
  
  const factors: PressureFactor[] = [
    {
      name: 'Current Occupancy',
      value: (currentOccupancy / totalBeds) * 100,
      threshold: 85,
      status: (currentOccupancy / totalBeds) > 0.9 ? 'critical' : (currentOccupancy / totalBeds) > 0.75 ? 'warning' : 'ok'
    },
    {
      name: 'Waiting Patients',
      value: waitingPatients,
      threshold: 10,
      status: waitingPatients > 15 ? 'critical' : waitingPatients > 8 ? 'warning' : 'ok'
    }
  ];
  
  return {
    level,
    score: Math.round(totalScore),
    description,
    timeToImpact,
    projectedOccupancy: (projectedOccupancy / totalBeds) * 100,
    factors
  };
}
