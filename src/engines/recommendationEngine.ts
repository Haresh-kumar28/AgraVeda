import { EDRecord } from '../data/syntheticData';
import { ForecastPoint } from './forecastEngine';
import { PressureResult, PressureLevel } from './pressureEngine';
import { BottleneckResult } from './bottleneckEngine';

export interface Recommendation {
  id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  urgency: PressureLevel;
  what: string;      // What operational problem is predicted?
  where: string;     // Which part of patient flow/resource system is affected?
  action: string;    // What should the administrator consider doing?
  reason: string;    // Short reason
  when: string;      // When is pressure expected?
  impact: string;    // What happens if action is taken?
  rationale: string[]; // WHY bullets
  category: 'beds' | 'staff' | 'diagnostics' | 'flow' | 'diversion';
  // Compatibility fields used by the decision brief UI
  title?: string;
  description?: string;
  type?: 'capacity' | 'staffing' | 'flow' | 'diagnostics' | 'diversion';
}

export function generateRecommendations(
  pressure: PressureResult, 
  bottlenecks: BottleneckResult, 
  currentRecord: EDRecord, 
  forecasts: ForecastPoint[]
): Recommendation[] {
  const recs: Recommendation[] = [];
  let idCounter = 1;
  
  const bedBottle = bottlenecks.all.find(b => b.resource === 'beds');
  const nurseBottle = bottlenecks.all.find(b => b.resource === 'nurses');
  const docBottle = bottlenecks.all.find(b => b.resource === 'doctors');
  
  const f2 = forecasts.find(f => f.hoursAhead === 2);
  const projOcc = f2 ? f2.predictedOccupancy : currentRecord.currentOccupancy;
  const occPct = (currentRecord.currentOccupancy / currentRecord.totalBeds) * 100;
  const projOccPct = (projOcc / currentRecord.totalBeds) * 100;
  
  if (bedBottle && bedBottle.gap < 0) {
    recs.push({
      id: `REC-${idCounter++}`,
      priority: bedBottle.gap <= -3 ? 'HIGH' : 'MEDIUM',
      urgency: bedBottle.gap <= -3 ? pressure.level : 'WATCH',
      what: `Bed capacity is projected to be exceeded — ${Math.abs(bedBottle.gap)} bed deficit expected.`,
      where: 'Treatment Beds — Bed capacity within the treatment area',
      action: `Prepare ${Math.abs(bedBottle.gap)} additional treatment beds before the projected peak.`,
      reason: 'Bed capacity deficit',
      when: pressure.timeToImpact !== 'N/A' ? pressure.timeToImpact : 'Within 2 hours',
      impact: `Adding ${Math.abs(bedBottle.gap)} beds reduces projected occupancy from ${projOccPct.toFixed(0)}% toward ${Math.max(70, projOccPct - Math.abs(bedBottle.gap) * 3).toFixed(0)}%`,
      category: 'beds',
      rationale: [
        `Forecasted arrivals + current occupancy indicate demand will exceed bed capacity`,
        `Projected occupancy reaches ${pressure.projectedOccupancy.toFixed(0)}%`,
        `Only ${currentRecord.availableBeds} beds remain available`,
        `Treatment beds are the ${bottlenecks.primary.resource === 'beds' ? 'primary' : 'projected'} constraint`
      ]
    });
  }
  
  if (nurseBottle && nurseBottle.gap < 0) {
    recs.push({
      id: `REC-${idCounter++}`,
      priority: nurseBottle.gap <= -2 ? 'HIGH' : 'MEDIUM',
      urgency: nurseBottle.gap <= -2 ? 'HIGH' : 'WATCH',
      what: `Nursing staff shortage projected — ${Math.abs(nurseBottle.gap)} additional nurses needed.`,
      where: 'Nursing Staff — Patient-to-nurse ratio at risk',
      action: `Consider activating ${Math.abs(nurseBottle.gap)} backup nurses during the projected peak.`,
      reason: 'Nursing staff shortage',
      when: 'Next shift / within 2 hours',
      impact: `Maintains safe 1:4 patient-to-nurse ratio during peak`,
      category: 'staff',
      rationale: [
        `Required nursing staff for projected load: ${nurseBottle.required}`,
        `Currently available nurses: ${nurseBottle.available}`,
        `Patient-to-nurse ratio will exceed safe threshold`
      ]
    });
  }
  
  if (docBottle && docBottle.gap < 0) {
    recs.push({
      id: `REC-${idCounter++}`,
      priority: 'MEDIUM',
      urgency: 'WATCH',
      what: `Physician capacity may be insufficient — ${Math.abs(docBottle.gap)} additional physician(s) needed.`,
      where: 'Physicians — Doctor assessment stage',
      action: `Request ${Math.abs(docBottle.gap)} additional physician(s) for the projected surge period.`,
      reason: 'Physician constraint',
      when: 'Next 2 hours',
      impact: 'Reduces initial assessment wait times and prevents queue buildup',
      category: 'staff',
      rationale: [
        `Required physicians for projected load: ${docBottle.required}`,
        `Currently available physicians: ${docBottle.available}`
      ]
    });
  }
  
  if (currentRecord.diagnosticQueue > 7) {
    recs.push({
      id: `REC-${idCounter++}`,
      priority: 'MEDIUM',
      urgency: 'WATCH',
      what: `Diagnostic services are near capacity — queue at ${currentRecord.diagnosticQueue} patients.`,
      where: 'Diagnostic Services — Imaging and laboratory',
      action: 'Prepare additional diagnostic capacity or redirect low-acuity patients.',
      reason: 'Diagnostic bottleneck',
      when: 'Immediate',
      impact: 'Improves patient flow and discharge rate',
      category: 'diagnostics',
      rationale: [
        `Diagnostic queue has reached ${currentRecord.diagnosticQueue} patients`,
        `High queue delays downstream treatment and disposition`
      ]
    });
  }
  
  if (occPct > 90) {
    recs.push({
      id: `REC-${idCounter++}`,
      priority: pressure.level === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
      urgency: pressure.level,
      what: `ED occupancy is critically high at ${occPct.toFixed(0)}% — limits intake capacity.`,
      where: 'Overall ED — Disposition and discharge flow',
      action: 'Prioritize discharge-ready patients to improve downstream capacity.',
      reason: 'High occupancy limits intake',
      when: 'Immediate',
      impact: 'Each discharge frees approximately 1 treatment bed within 30 minutes',
      category: 'flow',
      rationale: [
        `Current occupancy is at ${occPct.toFixed(0)}%`,
        `New arrivals may face extended boarding times`
      ]
    });
  }
  
  if (pressure.level === 'CRITICAL' && occPct > 95) {
    recs.push({
      id: `REC-${idCounter++}`,
      priority: 'HIGH',
      urgency: 'CRITICAL',
      what: 'ED is at or beyond maximum safe operating capacity.',
      where: 'ED-wide — All resource systems constrained',
      action: 'Consider ambulance diversion to nearby facilities.',
      reason: 'Critical capacity exceeded',
      when: 'Immediate',
      impact: 'Reduces incoming patient load, protects current patients',
      category: 'diversion',
      rationale: [
        `Pressure level is CRITICAL`,
        `Occupancy exceeds safe limits (${occPct.toFixed(0)}%)`,
        `Diversion prevents further degradation of care quality`
      ]
    });
  }
  
  // Sort by priority
  recs.sort((a, b) => {
    if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
    if (a.priority !== 'HIGH' && b.priority === 'HIGH') return 1;
    if (a.priority === 'MEDIUM' && b.priority === 'LOW') return -1;
    if (a.priority === 'LOW' && b.priority === 'MEDIUM') return 1;
    return 0;
  });
  
  return recs.slice(0, 3).map(rec => ({
    ...rec,
    title: rec.action,
    description: `${rec.what} ${rec.when}.`,
    type: rec.category === 'beds' ? 'capacity' : rec.category === 'staff' ? 'staffing' : rec.category
  }));
}
