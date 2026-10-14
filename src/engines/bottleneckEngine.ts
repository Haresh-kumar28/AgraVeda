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
  impact?: string;
  mitigation?: string;
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
  const bedsUtil = (currentRecord.currentOccupancy / currentRecord.totalBeds) * 100;
  const bedsReq = projOcc;
  const bedsGap = currentRecord.totalBeds - bedsReq;
  const projBedsUtil = (bedsReq / currentRecord.totalBeds) * 100;
  all.push({
    resource: 'beds',
    label: 'Treatment Beds',
    currentUtilization: bedsUtil,
    projectedUtilization: projBedsUtil,
    available: currentRecord.totalBeds,
    required: bedsReq,
    gap: bedsGap,
    isPrimary: false,
    status: projBedsUtil >= 95 || bedsUtil >= 95 ? 'critical' : projBedsUtil >= 85 || bedsUtil >= 85 ? 'warning' : 'ok',
    description: 'Treatment bed capacity',
    impactDetail: bedsGap < 0
      ? `Projected patient volume exceeds physical bed capacity by ${Math.abs(bedsGap)} beds at peak (+2h).`
      : bedsGap === 0
      ? 'Treatment beds projected to operate at 100% capacity with zero reserve buffer.'
      : `Treatment bed utilization projected at ${projBedsUtil.toFixed(0)}% with ${bedsGap} beds in reserve.`,
    impact: bedsGap < 0
      ? `Physical bed deficit of ${Math.abs(bedsGap)} beds at projected peak (+2h).`
      : bedsGap === 0
      ? 'Physical beds operating at full capacity ceiling with zero reserve buffer.'
      : `Physical bed utilization stable with ${bedsGap} beds in reserve.`,
    mitigation: bedsGap <= 0
      ? 'Initiate proactive discharge lounge transfers and expedite inpatient bed turnover.'
      : 'Maintain standard inpatient bed transfer cadence.'
  });
  
  // Nurses
  const nursesCapacity = currentRecord.nursesAvailable * 4;
  const nursesUtil = (currentRecord.currentOccupancy / Math.max(1, nursesCapacity)) * 100;
  const nursesReq = Math.ceil(projOcc / 4);
  const nursesGap = currentRecord.nursesAvailable - nursesReq;
  const projNursesUtil = (projOcc / Math.max(1, nursesCapacity)) * 100;
  all.push({
    resource: 'nurses',
    label: 'Nursing Staff',
    currentUtilization: Math.min(nursesUtil, 150),
    projectedUtilization: Math.min(projNursesUtil, 150),
    available: currentRecord.nursesAvailable,
    required: nursesReq,
    gap: nursesGap,
    isPrimary: false,
    status: projNursesUtil >= 95 || nursesUtil >= 95 ? 'critical' : projNursesUtil >= 85 || nursesUtil >= 85 ? 'warning' : 'ok',
    description: 'Active floor and triage nursing staff (1:4 ratio)',
    impactDetail: nursesGap < 0
      ? `Projected patient demand exceeds nursing coverage ratio by ${Math.abs(nursesGap)} nurses at peak (+2h).`
      : nursesGap === 0
      ? 'Nursing staff operating at 100% capacity with zero reserve operational buffer.'
      : `Nursing workload projected at ${projNursesUtil.toFixed(0)}% with ${nursesGap} nurses in operational reserve.`,
    impact: nursesGap < 0
      ? `Nursing deficit of ${Math.abs(nursesGap)} nurses below mandated 1:4 ratios at peak (+2h).`
      : nursesGap === 0
      ? 'Nursing staff at 100% ratio ceiling with zero buffer for acuity spikes.'
      : `Nursing staffing ratio stable with ${nursesGap} staff buffer.`,
    mitigation: nursesGap <= 0
      ? 'Call in float nursing pool or activate break relief shift reassignments.'
      : 'Maintain scheduled floor nurse shift allocation.'
  });
  
  // Doctors
  const docsCapacity = currentRecord.doctorsAvailable * 6;
  const docsUtil = (currentRecord.currentOccupancy / Math.max(1, docsCapacity)) * 100;
  const docsReq = Math.ceil(projOcc / 6);
  const docsGap = currentRecord.doctorsAvailable - docsReq;
  const projDocsUtil = (projOcc / Math.max(1, docsCapacity)) * 100;
  all.push({
    resource: 'doctors',
    label: 'Attending Physicians',
    currentUtilization: Math.min(docsUtil, 150),
    projectedUtilization: Math.min(projDocsUtil, 150),
    available: currentRecord.doctorsAvailable,
    required: docsReq,
    gap: docsGap,
    isPrimary: false,
    status: projDocsUtil >= 95 || docsUtil >= 95 ? 'critical' : projDocsUtil >= 85 || docsUtil >= 85 ? 'warning' : 'ok',
    description: 'Board-certified emergency physicians (1:6 ratio)',
    impactDetail: docsGap < 0
      ? `Projected assessment volume exceeds physician capacity by ${Math.abs(docsGap)} doctors at peak (+2h).`
      : docsGap === 0
      ? 'Physicians operating at 100% assessment ratio ceiling with zero reserve buffer.'
      : `Physician workload projected at ${projDocsUtil.toFixed(0)}% with ${docsGap} physicians in reserve.`,
    impact: docsGap < 0
      ? `Physician deficit of ${Math.abs(docsGap)} providers below 1:6 ratio at peak (+2h).`
      : docsGap === 0
      ? 'Physicians operating at capacity ceiling with no margin for complex resuscitations.'
      : `Physician coverage ratio stable with ${docsGap} provider margin.`,
    mitigation: docsGap <= 0
      ? 'Assign fast-track midlevel provider and page on-call attending for surge intake.'
      : 'Maintain standard physician triage and assessment workflow.'
  });
  
  // Diagnostics
  const diagCapacity = 10;
  const diagUtil = Math.min((currentRecord.diagnosticQueue / diagCapacity) * 100, 150);
  const diagReq = Math.ceil(projArr * 0.6);
  const diagGap = diagCapacity - diagReq;
  const projDiagUtil = Math.min((diagReq / diagCapacity) * 100, 150);
  all.push({
    resource: 'diagnostics',
    label: 'Diagnostic Services',
    currentUtilization: diagUtil,
    projectedUtilization: projDiagUtil,
    available: diagCapacity,
    required: diagReq,
    gap: diagGap,
    isPrimary: false,
    status: projDiagUtil >= 95 || diagUtil >= 95 ? 'critical' : projDiagUtil >= 85 || diagUtil >= 85 ? 'warning' : 'ok',
    description: 'Rapid turnaround imaging, ultrasound, and stat labs',
    impactDetail: diagGap < 0
      ? `Testing demand exceeds imaging and lab turnaround throughput by ${Math.abs(diagGap)} slots.`
      : diagGap === 0
      ? 'Diagnostics operating at full slot capacity with zero reserve buffer.'
      : `Diagnostic throughput projected at ${projDiagUtil.toFixed(0)}% with ${diagGap} available testing slots.`,
    impact: diagGap < 0
      ? `Diagnostic queue overflow of ${Math.abs(diagGap)} tests delaying disposition decisions.`
      : diagGap === 0
      ? 'Diagnostic modalities at maximum throughput with zero reserve queue capacity.'
      : `Diagnostic throughput balanced with ${diagGap} slots in reserve.`,
    mitigation: diagGap <= 0
      ? 'Prioritize stat imaging orders and deploy point-of-care ultrasound (POCUS) at bedside.'
      : 'Normal diagnostic lab and imaging protocol.'
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
