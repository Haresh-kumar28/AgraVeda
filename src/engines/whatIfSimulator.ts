import { EDRecord } from '../data/syntheticData';
import { ForecastPoint } from './forecastEngine';
import { PressureResult, PressureLevel } from './pressureEngine';
import { BottleneckResult } from './bottleneckEngine';

export interface WhatIfParams {
  additionalBeds: number;
  additionalNurses: number;
  additionalDoctors: number;
  patientSurgePercent: number;
}

export interface WhatIfResult {
  baseline: SimState;
  simulated: SimState;
  impact: SimImpact;
  baselinePeakOccupancy: number;
  simulatedPeakOccupancy: number;
  baselineMaxWait: number;
  simulatedMaxWait: number;
}

export interface SimState {
  occupancyPercent: number;
  waitingTime: number;
  pressureLevel: PressureLevel;
  pressureScore: number;
  availableBeds: number;
  bottleneck: string;
}

export interface SimImpact {
  occupancyChange: number; 
  waitTimeChange: number;
  pressureBefore: PressureLevel;
  pressureAfter: PressureLevel;
  summary: string;
}

export function runWhatIfSimulation(
  currentRecord: EDRecord, 
  forecasts: ForecastPoint[], 
  pressure: PressureResult, 
  bottlenecks: BottleneckResult, 
  params: WhatIfParams
): WhatIfResult {
  
  // Baseline
  const baseline: SimState = {
    occupancyPercent: (currentRecord.currentOccupancy / currentRecord.totalBeds) * 100,
    waitingTime: currentRecord.averageWaitTime,
    pressureLevel: pressure.level,
    pressureScore: pressure.score,
    availableBeds: currentRecord.availableBeds,
    bottleneck: bottlenecks.primary.label
  };
  
  // Simulated
  const newTotalBeds = currentRecord.totalBeds + params.additionalBeds;
  const bedsInUse = currentRecord.totalBeds - currentRecord.availableBeds;
  const newAvailableBeds = newTotalBeds - bedsInUse;
  
  const f2 = forecasts.find(f => f.hoursAhead === 2);
  const projArr = f2 ? f2.predictedArrivals : currentRecord.arrivals;
  const newProjArr = projArr * (1 + params.patientSurgePercent / 100);
  
  // Estimate new occupancy based on new arrivals
  let estimatedNewOccupancy = bedsInUse + newProjArr - (newProjArr * 0.75); // approx departures
  const newOccupancyPercent = Math.min((estimatedNewOccupancy / newTotalBeds) * 100, 100);
  
  // Simple heuristic for new wait time
  const capacityFactor = (newTotalBeds / currentRecord.totalBeds) * 
                         (1 + (params.additionalNurses + params.additionalDoctors) / (currentRecord.nursesAvailable + currentRecord.doctorsAvailable));
  const loadFactor = (1 + params.patientSurgePercent / 100);
  let newWaitTime = currentRecord.averageWaitTime * (loadFactor / capacityFactor);
  newWaitTime = Math.max(0, Math.round(newWaitTime));
  
  // New pressure score
  const occupancyScore = Math.min((estimatedNewOccupancy / newTotalBeds) * 30, 30);
  const projScore = Math.min((estimatedNewOccupancy / newTotalBeds) * 25, 25);
  const waitScore = Math.min((newWaitTime / 15), 1) * 20; // Reusing logic
  const bedScore = Math.min(Math.max(0, 1 - newAvailableBeds / 8) * 15, 15);
  const staffScore = Math.min(Math.max(0, 1 - (currentRecord.doctorsAvailable + params.additionalDoctors + currentRecord.nursesAvailable + params.additionalNurses) / 26) * 10, 10);
  
  const newPressureScore = Math.round(occupancyScore + projScore + waitScore + bedScore + staffScore);
  let newPressureLevel: PressureLevel = 'NORMAL';
  if (newPressureScore > 70) newPressureLevel = 'CRITICAL';
  else if (newPressureScore > 50) newPressureLevel = 'HIGH';
  else if (newPressureScore > 30) newPressureLevel = 'WATCH';
  
  // New bottleneck naive estimation
  let newBottleneck = bottlenecks.primary.label;
  if (params.additionalBeds > 0 && bottlenecks.primary.resource === 'beds') {
      newBottleneck = 'Nursing Staff'; // Might shift
  }

  const simulated: SimState = {
    occupancyPercent: newOccupancyPercent,
    waitingTime: newWaitTime,
    pressureLevel: newPressureLevel,
    pressureScore: newPressureScore,
    availableBeds: Math.max(0, newAvailableBeds),
    bottleneck: newBottleneck
  };
  
  const impact: SimImpact = {
    occupancyChange: simulated.occupancyPercent - baseline.occupancyPercent,
    waitTimeChange: simulated.waitingTime - baseline.waitingTime,
    pressureBefore: baseline.pressureLevel,
    pressureAfter: simulated.pressureLevel,
    summary: `Modifying resources (${params.additionalBeds} beds, ${params.additionalNurses} nurses, ${params.additionalDoctors} docs) and demand (${params.patientSurgePercent}% surge) shifts occupancy by ${(simulated.occupancyPercent - baseline.occupancyPercent).toFixed(1)}% and changes pressure from ${baseline.pressureLevel} to ${simulated.pressureLevel}.`
  };
  
  return {
    baseline,
    simulated,
    impact,
    baselinePeakOccupancy: Number(baseline.occupancyPercent.toFixed(1)),
    simulatedPeakOccupancy: Number(simulated.occupancyPercent.toFixed(1)),
    baselineMaxWait: baseline.waitingTime,
    simulatedMaxWait: simulated.waitingTime
  };
}
