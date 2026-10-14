import { EDRecord } from '../data/syntheticData';
import { ForecastPoint } from './forecastEngine';
import { PressureResult, PressureLevel, calculatePressure } from './pressureEngine';
import { BottleneckResult, analyzeBottlenecks } from './bottleneckEngine';

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
  bottleneckShift?: string;
}

export function runWhatIfSimulation(
  currentRecord: EDRecord, 
  forecasts: ForecastPoint[], 
  pressure: PressureResult, 
  bottlenecks: BottleneckResult, 
  params: WhatIfParams
): WhatIfResult {
  
  // 1. Authoritative Baseline State
  const baseTotalBeds = currentRecord.totalBeds;
  const baseOccupancyPercent = (currentRecord.currentOccupancy / baseTotalBeds) * 100;
  const baseAvailableBeds = Math.max(0, currentRecord.totalBeds - currentRecord.currentOccupancy);

  const baseline: SimState = {
    occupancyPercent: baseOccupancyPercent,
    waitingTime: currentRecord.averageWaitTime,
    pressureLevel: pressure.level,
    pressureScore: pressure.score,
    availableBeds: baseAvailableBeds,
    bottleneck: bottlenecks.primary.label,
  };

  // 2. Exact Zero-Intervention Check
  // Under identical inputs and assumptions, a zero-intervention scenario MUST reproduce the baseline exactly
  const isZeroIntervention =
    params.additionalBeds === 0 &&
    params.additionalNurses === 0 &&
    params.additionalDoctors === 0 &&
    params.patientSurgePercent === 0;

  if (isZeroIntervention) {
    return {
      baseline,
      simulated: { ...baseline },
      impact: {
        occupancyChange: 0,
        waitTimeChange: 0,
        pressureBefore: baseline.pressureLevel,
        pressureAfter: baseline.pressureLevel,
        summary: 'Baseline operational equilibrium active. No resource interventions or external demand shocks applied.',
        bottleneckShift: 'Unchanged',
      },
      baselinePeakOccupancy: Number(baseline.occupancyPercent.toFixed(1)),
      simulatedPeakOccupancy: Number(baseline.occupancyPercent.toFixed(1)),
      baselineMaxWait: baseline.waitingTime,
      simulatedMaxWait: baseline.waitingTime,
    };
  }

  // 3. Derived Simulated State via Authentic Analytical Pipeline
  const simTotalBeds = Math.max(1, currentRecord.totalBeds + params.additionalBeds);
  const surgeMultiplier = 1 + params.patientSurgePercent / 100;
  
  // Extra incoming patients from surge
  const effectiveArrivals = Math.max(1, Math.round(currentRecord.arrivals * surgeMultiplier));
  const additionalSurgePatients = Math.round((effectiveArrivals - currentRecord.arrivals) * 0.6);
  
  // Effective simulated occupancy
  const simOccupancy = Math.max(0, Math.min(simTotalBeds, currentRecord.currentOccupancy + additionalSurgePatients));
  const simAvailableBeds = Math.max(0, simTotalBeds - simOccupancy);
  const simOccupancyPercent = (simOccupancy / simTotalBeds) * 100;

  // Staffing additions
  const simNurses = Math.max(1, currentRecord.nursesAvailable + params.additionalNurses);
  const simDoctors = Math.max(1, currentRecord.doctorsAvailable + params.additionalDoctors);

  // Staff and bed throughput capacity relief ratio
  const baselineStaff = Math.max(1, currentRecord.nursesAvailable + currentRecord.doctorsAvailable);
  const simulatedStaff = simNurses + simDoctors;
  const staffExpansionRatio = simulatedStaff / baselineStaff;
  const bedExpansionRatio = simTotalBeds / currentRecord.totalBeds;

  // Composite capacity relief factor (40% bed availability, 60% clinical staff coverage)
  const capacityRelief = Math.max(0.4, Math.min(3.0, (0.4 * bedExpansionRatio) + (0.6 * staffExpansionRatio)));

  // Simulated wait time and waiting queue
  const simWaitTime = Math.max(5, Math.round(currentRecord.averageWaitTime * (surgeMultiplier / capacityRelief)));
  const simWaitingPatients = Math.max(0, Math.round(currentRecord.waitingPatients * (surgeMultiplier / capacityRelief)));

  // 4. Construct Simulated Record for Downstream Analytical Engines
  const simRecord: EDRecord = {
    ...currentRecord,
    totalBeds: simTotalBeds,
    currentOccupancy: simOccupancy,
    availableBeds: simAvailableBeds,
    arrivals: effectiveArrivals,
    waitingPatients: simWaitingPatients,
    averageWaitTime: simWaitTime,
    nursesAvailable: simNurses,
    doctorsAvailable: simDoctors,
  };

  // 5. Construct Simulated Forecast Points (+2h peak adjustments)
  const simForecasts: ForecastPoint[] = forecasts.map((f) => {
    const projectedSurge = f.predictedArrivals * surgeMultiplier;
    const deltaFromBaseArrivals = Math.round((projectedSurge - f.predictedArrivals) * 0.6);
    const simProjOcc = Math.max(0, Math.min(simTotalBeds, f.predictedOccupancy + deltaFromBaseArrivals));
    return {
      ...f,
      predictedArrivals: Math.round(projectedSurge),
      predictedOccupancy: simProjOcc,
      predictedWaiting: Math.max(0, Math.round(f.predictedWaiting * (surgeMultiplier / capacityRelief))),
    };
  });

  // 6. Evaluate Real Operational Pressure and Bottlenecks through Engines
  const simPressure = calculatePressure(simRecord, simForecasts);
  const simBottlenecks = analyzeBottlenecks(simRecord, simForecasts);

  const simulated: SimState = {
    occupancyPercent: simOccupancyPercent,
    waitingTime: simWaitTime,
    pressureLevel: simPressure.level,
    pressureScore: simPressure.score,
    availableBeds: simAvailableBeds,
    bottleneck: simBottlenecks.primary.label,
  };

  // 7. Explanatory Impact Summary
  const occDiff = simulated.occupancyPercent - baseline.occupancyPercent;
  const waitDiff = simulated.waitingTime - baseline.waitingTime;
  const bedDiff = simulated.availableBeds - baseline.availableBeds;

  let bottleneckShiftNote = 'Constraint remained constant.';
  if (simulated.bottleneck !== baseline.bottleneck) {
    bottleneckShiftNote = `Primary constraint shifted from ${baseline.bottleneck} to ${simulated.bottleneck}.`;
  }

  const interventionsList: string[] = [];
  if (params.additionalBeds > 0) interventionsList.push(`+${params.additionalBeds} beds`);
  if (params.additionalNurses > 0) interventionsList.push(`+${params.additionalNurses} nurses`);
  if (params.additionalDoctors > 0) interventionsList.push(`+${params.additionalDoctors} doctors`);
  if (params.patientSurgePercent !== 0) {
    interventionsList.push(`${params.patientSurgePercent > 0 ? '+' : ''}${params.patientSurgePercent}% demand shock`);
  }

  const summary = `Intervention package (${interventionsList.join(', ')}) shifts occupancy by ${occDiff > 0 ? '+' : ''}${occDiff.toFixed(1)}%, adjusts wait times by ${waitDiff > 0 ? '+' : ''}${waitDiff} min, and ${
    baseline.pressureLevel === simulated.pressureLevel
      ? `maintains ${simulated.pressureLevel} pressure.`
      : `moves operational pressure from ${baseline.pressureLevel} to ${simulated.pressureLevel}.`
  } ${bottleneckShiftNote}`;

  return {
    baseline,
    simulated,
    impact: {
      occupancyChange: occDiff,
      waitTimeChange: waitDiff,
      pressureBefore: baseline.pressureLevel,
      pressureAfter: simulated.pressureLevel,
      summary,
      bottleneckShift: bottleneckShiftNote,
    },
    baselinePeakOccupancy: Number(baseline.occupancyPercent.toFixed(1)),
    simulatedPeakOccupancy: Number(simulated.occupancyPercent.toFixed(1)),
    baselineMaxWait: baseline.waitingTime,
    simulatedMaxWait: simulated.waitingTime,
  };
}
