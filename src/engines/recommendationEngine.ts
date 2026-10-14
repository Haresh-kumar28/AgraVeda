import { EDRecord } from '../data/syntheticData';
import { ForecastPoint } from './forecastEngine';
import { PressureResult, PressureLevel } from './pressureEngine';
import { BottleneckResult } from './bottleneckEngine';

export interface Recommendation {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  urgency: PressureLevel;
  what: string;      // Operational situation / problem identified
  where: string;     // Physical unit or flow bottleneck stage
  action: string;    // Operational consideration for charge team / administrators
  reason: string;    // Concise underlying driver
  when: string;      // Anticipated impact horizon
  impact: string;    // Expected operational consequence of consideration
  heuristicType: 'ESTIMATED_HEURISTIC' | 'OBSERVED_STANDARD';
  rationale: string[]; // Contributing driver bullet points
  observedInputs: string[]; // Real sensor / EHR inputs observed right now
  forecastValues: string[]; // Model forward projections
  assumptions: string;      // Explicit operational assumptions
  limitations: string;      // Operational and clinical limitations
  category: 'beds' | 'staff' | 'diagnostics' | 'flow' | 'diversion';
  generatedAt?: string;
  sourceWindow?: string;
  // Compatibility fields used by secondary views
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
  const projArrivals = f2 ? f2.predictedArrivals : currentRecord.arrivals;

  // 1. Bed Capacity Deficit or Zero-Buffer Ceiling
  if (bedBottle && (bedBottle.gap < 0 || (bedBottle.gap === 0 && projOccPct >= 95))) {
    const deficitCount = bedBottle.gap < 0 ? Math.abs(bedBottle.gap) : 2;
    recs.push({
      id: `REC-BED-${idCounter++}`,
      priority: bedBottle.gap <= -3 || projOccPct >= 100 ? 'CRITICAL' : 'HIGH',
      urgency: pressure.level,
      what: bedBottle.gap < 0
        ? `Physical bed capacity projected to be breached with an estimated ${deficitCount} bed shortage at peak.`
        : `Physical beds projected to operate at 100% capacity ceiling with zero reserve buffer.`,
      where: 'Emergency Treatment Bays & Acute Monitored Stretchers',
      action: `Prepare ${deficitCount} additional observation stretchers or expedite inpatient discharge lounge transfers.`,
      reason: 'Physical bed saturation and boarding bottleneck',
      when: pressure.timeToImpact !== 'N/A' ? pressure.timeToImpact : 'Within +2 hours peak',
      impact: `Illustrative Heuristic: Activating ${deficitCount} surge spaces expands physical bed capacity from ${currentRecord.totalBeds} to ${currentRecord.totalBeds + deficitCount} beds, providing operational buffer to absorb EMS offloads.`,
      heuristicType: 'ESTIMATED_HEURISTIC',
      observedInputs: [
        `Current physical occupancy: ${currentRecord.currentOccupancy} of ${currentRecord.totalBeds} beds (${occPct.toFixed(0)}%)`,
        `Available unassigned treatment stretchers: ${currentRecord.availableBeds} beds`,
        `Current arrival rate: ${currentRecord.arrivals} patients/hour`,
        `Triage waiting queue: ${currentRecord.waitingPatients} patients awaiting bed assignment`,
      ],
      forecastValues: [
        `Projected peak occupancy (+2h): ${projOcc} beds (${projOccPct.toFixed(0)}% load)`,
        `Projected peak arrivals (+2h): ${projArrivals} arrivals/hour`,
        `Time to critical capacity ceiling: ${pressure.timeToImpact}`,
      ],
      assumptions: 'Assumes inpatient discharge rate of ~75% of incoming demand and standard observation bed turnover.',
      limitations: 'Physical space expansion requires available monitored telemetry stretchers and transport staff.',
      category: 'beds',
      rationale: [
        `Forecasted arrivals + current occupancy indicate demand will saturate physical bed capacity`,
        `Projected occupancy reaches ${projOccPct.toFixed(0)}% within 2 hours`,
        `Only ${currentRecord.availableBeds} physical beds remain in reserve`,
        `Treatment beds are identified as the primary operational constraint (${bedBottle.projectedUtilization.toFixed(0)}% projected load)`,
      ],
      sourceWindow: 'Last 3 hours trend + 2 hours forward Poisson forecast',
      generatedAt: 'Latest Stream Cycle (Continuous)',
    });
  }
  
  // 2. Nursing Staffing Ratio
  if (nurseBottle && nurseBottle.gap < 0) {
    const neededRNs = Math.abs(nurseBottle.gap);
    recs.push({
      id: `REC-RN-${idCounter++}`,
      priority: neededRNs >= 3 ? 'HIGH' : 'MEDIUM',
      urgency: neededRNs >= 2 ? 'HIGH' : 'WATCH',
      what: `Mandated 1:4 nursing coverage ratio at risk of breach — ${neededRNs} additional nurse(s) required for peak intake.`,
      where: 'Clinical Nursing & Bedside Triage Coverage',
      action: `Contact float nursing pool or activate break relief reassignments to cover ${neededRNs} additional nursing slots.`,
      reason: 'Mandated staffing ratio constraint',
      when: 'Next shift transition / Within +2 hours',
      impact: `Operational Standard: Restores compliance with mandated 1:4 acute nursing ratios, preventing delays in medication administration and triage handoffs.`,
      heuristicType: 'OBSERVED_STANDARD',
      observedInputs: [
        `Active nurses on duty: ${nurseBottle.available} nurses`,
        `Current nurse-to-patient ratio: ~1:${(currentRecord.currentOccupancy / Math.max(1, nurseBottle.available)).toFixed(1)}`,
        `Total active patient load: ${currentRecord.currentOccupancy} patients`,
      ],
      forecastValues: [
        `Required nurses for projected +2h volume: ${nurseBottle.required} nurses (at 1:4 standard)`,
        `Net projected nursing gap: -${neededRNs} nurses`,
        `Projected nursing utilization: ${nurseBottle.projectedUtilization.toFixed(0)}%`,
      ],
      assumptions: 'Based on statutory 1:4 nurse-to-patient ratio in emergency treatment bays.',
      limitations: 'Float nurse activation depends on hospital-wide float pool availability and shift agreements.',
      category: 'staff',
      rationale: [
        `Required nursing staff for projected load: ${nurseBottle.required} nurses`,
        `Currently available nurses on floor: ${nurseBottle.available} nurses`,
        `Unmitigated demand will push staff ratios beyond clinical safety guidelines`,
      ],
      sourceWindow: 'Current shift roster + 2h forward volume forecast',
      generatedAt: 'Latest Stream Cycle (Continuous)',
    });
  }
  
  // 3. Attending Physician Coverage
  if (docBottle && docBottle.gap < 0) {
    const neededMDs = Math.abs(docBottle.gap);
    recs.push({
      id: `REC-MD-${idCounter++}`,
      priority: 'MEDIUM',
      urgency: 'WATCH',
      what: `Provider assessment capacity may bottleneck — projected volume exceeds 1:6 physician coverage ratio by ${neededMDs} provider(s).`,
      where: 'Provider Initial Assessment & Disposition',
      action: `Request ${neededMDs} on-call attending or assign fast-track advanced practice provider (APP) to triage intake.`,
      reason: 'Physician assessment throughput constraint',
      when: 'Next 2 hours',
      impact: `Illustrative Heuristic: Midlevel provider support can absorb minor-acuity assessments (ESI 4 & 5), keeping physician assessment wait times within 30 minutes.`,
      heuristicType: 'ESTIMATED_HEURISTIC',
      observedInputs: [
        `Attending physicians on floor: ${docBottle.available} MDs`,
        `Current doctor-to-patient ratio: ~1:${(currentRecord.currentOccupancy / Math.max(1, docBottle.available)).toFixed(1)}`,
      ],
      forecastValues: [
        `Required providers for projected volume: ${docBottle.required} MDs (at 1:6 ratio)`,
        `Net provider gap: -${neededMDs} MDs`,
        `Projected provider utilization: ${docBottle.projectedUtilization.toFixed(0)}%`,
      ],
      assumptions: 'Assumes 1:6 provider ratio for acute assessment and minor trauma intake.',
      limitations: 'Provider availability subject to department on-call schedule and credentialing.',
      category: 'staff',
      rationale: [
        `Required physicians for projected load: ${docBottle.required} MDs`,
        `Currently scheduled physicians: ${docBottle.available} MDs`,
        `Provider deficit may increase Door-to-Doctor time during afternoon peak`,
      ],
      sourceWindow: 'Current provider schedule + 2h demand projection',
      generatedAt: 'Latest Stream Cycle (Continuous)',
    });
  }
  
  // 4. Diagnostic Queue & Turnaround
  if (currentRecord.diagnosticQueue > 6) {
    recs.push({
      id: `REC-DIAG-${idCounter++}`,
      priority: currentRecord.diagnosticQueue > 9 ? 'HIGH' : 'MEDIUM',
      urgency: 'WATCH',
      what: `Diagnostic testing services are congested with ${currentRecord.diagnosticQueue} patients in the stat lab and imaging queue.`,
      where: 'Diagnostic Ancillary Services (CT, Ultrasound, Stat Labs)',
      action: 'Prioritize stat imaging orders and consider bedside point-of-care ultrasound (POCUS) for low-acuity workups.',
      reason: 'Diagnostic turnaround bottleneck',
      when: 'Immediate / Next 1 hour',
      impact: `Operational Standard: Clearing imaging backlog prevents delays in disposition decisions, accelerating overall treatment bay turnover.`,
      heuristicType: 'OBSERVED_STANDARD',
      observedInputs: [
        `Diagnostic queue depth: ${currentRecord.diagnosticQueue} pending orders`,
        `Nominal concurrent slot capacity: 10 concurrent slots`,
        `Queue saturation: ${Math.round((currentRecord.diagnosticQueue / 10) * 100)}%`,
      ],
      forecastValues: [
        `Expected diagnostic orders from incoming arrivals: ~${Math.round(projArrivals * 0.6)} orders/hour`,
        `Queue clearance time estimated at 45–60 minutes without rapid protocols`,
      ],
      assumptions: 'Assumes ~60% of incoming acute patients require laboratory or diagnostic imaging.',
      limitations: 'Scanner maintenance and radiologist turnaround times vary based on hospital inpatient volume.',
      category: 'diagnostics',
      rationale: [
        `Diagnostic queue has reached ${currentRecord.diagnosticQueue} pending patients`,
        `High testing queues directly prolong length of stay (LOS) and block treatment stretchers`,
      ],
      sourceWindow: 'Real-time diagnostic order queue',
      generatedAt: 'Latest Stream Cycle (Continuous)',
    });
  }
  
  // 5. ED-Wide Flow & Disposition Escalation
  if (occPct > 90) {
    recs.push({
      id: `REC-FLOW-${idCounter++}`,
      priority: pressure.level === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      urgency: pressure.level,
      what: `ED occupancy is critically elevated at ${occPct.toFixed(0)}%, constricting intake and ambulance offload.`,
      where: 'ED-Wide Flow & Inpatient Bed Placement Coordination',
      action: 'Coordinate with inpatient bed placement to expedite transfers for admitted patients boarded in the ED.',
      reason: 'Elevated occupancy constrains intake',
      when: 'Immediate',
      impact: `Illustrative Heuristic: Transferring 3 admitted boarders to inpatient floors frees acute stretchers to absorb pending triage arrivals within 30 minutes.`,
      heuristicType: 'ESTIMATED_HEURISTIC',
      observedInputs: [
        `Overall occupancy: ${occPct.toFixed(0)}% (${currentRecord.currentOccupancy}/${currentRecord.totalBeds} beds)`,
        `Waiting queue: ${currentRecord.waitingPatients} patients in waiting room`,
        `Average wait time: ${currentRecord.averageWaitTime} minutes`,
      ],
      forecastValues: [
        `Projected +2h occupancy: ${projOccPct.toFixed(0)}%`,
        `Pressure score: ${pressure.score}/100 (${pressure.level})`,
      ],
      assumptions: 'Admitted patients waiting for inpatient beds constitute primary source of ED boarding.',
      limitations: 'Inpatient bed availability depends on hospital discharge lounge throughput and environmental cleaning.',
      category: 'flow',
      rationale: [
        `Current census consumes ${occPct.toFixed(0)}% of total licensed capacity`,
        `Arrivals face escalating waiting room times without active bed placement interventions`,
      ],
      sourceWindow: 'EHR real-time census stream',
      generatedAt: 'Latest Stream Cycle (Continuous)',
    });
  }
  
  // Sort by priority
  const priorityOrder: Record<string, number> = {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4,
  };

  recs.sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4));
  
  return recs.map(rec => ({
    ...rec,
    title: rec.action,
    description: `${rec.what} ${rec.when}.`,
    type: rec.category === 'beds' ? 'capacity' : rec.category === 'staff' ? 'staffing' : rec.category
  }));
}
