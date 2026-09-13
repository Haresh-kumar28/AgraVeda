import { EDRecord } from '../data/syntheticData';
import { ForecastPoint } from './forecastEngine';

export interface BottleneckResult {
  primary: ResourceBottleneck;
  all: ResourceBottleneck[];
  // Compatibility aliases for page components
  primaryBottleneck: ResourceBottleneck;
  resources: ResourceBottleneck[];
}

export interface ResourceBottleneck {
  resource: 'beds' | 'nurses' | 'doctors' | 'diagnostics';
  label: string;
  currentUtilization: number;
  projectedUtilization: number;
  available: number;
  required: number;
  gap: number;
  isPrimary: boolean;
  status: 'ok' | 'warning' | 'critical';
  description: string;
  impactDetail: string;
}

export function analyzeBottlenecks(currentRecord: EDRecord, forecasts: ForecastPoint[]): BottleneckResult {
  const all: ResourceBottleneck[] = [];
  
  let projOcc = currentRecord.currentOccupancy;
  let projArr = currentRecord.arrivals;
  
  const f2 = forecasts.find(f => f.hoursAhead === 2);
  if (f2) {
    projOcc = f2.predictedOccupancy;
    projArr = f2.predictedArrivals;
  }
  
  // Beds
  const bedsUtil = ((currentRecord.totalBeds - currentRecord.availableBeds) / currentRecord.totalBeds) * 100;
  const bedsReq = Math.ceil(projOcc * 0.9);
  const bedsGap = currentRecord.availableBeds - bedsReq;
  all.push({
    resource: 'beds',
    label: 'Treatment Beds',
    currentUtilization: bedsUtil,
    projectedUtilization: (bedsReq / currentRecord.totalBeds) * 100,
    available: currentRecord.availableBeds,
    required: bedsReq,
    gap: bedsGap,
    isPrimary: false,
    status: bedsUtil >= 90 ? 'critical' : bedsUtil >= 75 ? 'warning' : 'ok',
    description: 'Treatment bed capacity',
    impactDetail: 'Projected bed utilization may constrain patient flow.'
  });
  
  // Nurses
  const nursesUtil = (currentRecord.currentOccupancy / (currentRecord.nursesAvailable * 4)) * 100;
  const nursesReq = Math.ceil(projOcc / 4);
  const nursesGap = currentRecord.nursesAvailable - nursesReq;
  all.push({
    resource: 'nurses',
    label: 'Nursing Staff',
    currentUtilization: Math.min(nursesUtil, 100),
    projectedUtilization: Math.min((projOcc / (nursesReq * 4)) * 100, 100) || 0,
    available: currentRecord.nursesAvailable,
    required: nursesReq,
    gap: nursesGap,
    isPrimary: false,
    status: nursesUtil >= 90 ? 'critical' : nursesUtil >= 75 ? 'warning' : 'ok',
    description: 'Nursing staff capacity',
    impactDetail: 'Projected nursing workload may constrain active care.'
  });
  
  // Doctors
  const docsUtil = (currentRecord.currentOccupancy / (currentRecord.doctorsAvailable * 6)) * 100;
  const docsReq = Math.ceil(projOcc / 6);
  const docsGap = currentRecord.doctorsAvailable - docsReq;
  all.push({
    resource: 'doctors',
    label: 'Physicians',
    currentUtilization: Math.min(docsUtil, 100),
    projectedUtilization: Math.min((projOcc / (docsReq * 6)) * 100, 100) || 0,
    available: currentRecord.doctorsAvailable,
    required: docsReq,
    gap: docsGap,
    isPrimary: false,
    status: docsUtil >= 90 ? 'critical' : docsUtil >= 75 ? 'warning' : 'ok',
    description: 'Physician capacity',
    impactDetail: 'Projected physician workload may constrain assessment.'
  });
  
  // Diagnostics
  const diagUtil = Math.min((currentRecord.diagnosticQueue / 10) * 100, 100);
  const diagReq = Math.ceil(projArr * 0.6);
  const diagCapacity = 10;
  const diagGap = diagCapacity - diagReq;
  all.push({
    resource: 'diagnostics',
    label: 'Diagnostic Services',
    currentUtilization: diagUtil,
    projectedUtilization: Math.min((diagReq / diagCapacity) * 100, 100),
    available: diagCapacity,
    required: diagReq,
    gap: diagGap,
    isPrimary: false,
    status: diagUtil >= 90 ? 'critical' : diagUtil >= 75 ? 'warning' : 'ok',
    description: 'Diagnostic imaging and labs',
    impactDetail: 'Projected diagnostic demand may constrain downstream flow.'
  });
  
  // Primary
  all.sort((a, b) => b.projectedUtilization - a.projectedUtilization);
  all[0].isPrimary = true;
  
  return {
    primary: all[0],
    all,
    primaryBottleneck: all[0],
    resources: all
  };
}
