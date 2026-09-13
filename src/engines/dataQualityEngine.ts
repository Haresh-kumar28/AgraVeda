import { EDRecord } from '../data/syntheticData';

export interface DataQualityReport {
  totalRecords: number;
  validRecords: number;
  completenessPercent: number;
  missingValueCount: number;
  missingFields: { field: string; count: number }[];
  outlierCount: number;
  outliers: { field: string; index: number; value: number; reason: string }[];
  timestampIssues: number;
  overallQuality: 'good' | 'acceptable' | 'degraded' | 'poor';
  qualityScore: number;
  warnings: string[];
  canRunModel: boolean;
  fallbackReason: string | null;
}

export function detectOutliers(data: EDRecord[]): { field: string; index: number; value: number; reason: string }[] {
  const outliers: { field: string; index: number; value: number; reason: string }[] = [];
  data.forEach((record, i) => {
    // Assuming 50 total beds if not explicit
    const totalBeds = record.totalBeds || 40;

    if (record.arrivals > 40 || record.arrivals < 0) {
      outliers.push({ field: 'arrivals', index: i, value: record.arrivals, reason: 'Out of range [0, 40]' });
    }
    if (record.currentOccupancy > totalBeds || record.currentOccupancy < 0) {
      outliers.push({ field: 'currentOccupancy', index: i, value: record.currentOccupancy, reason: `Out of range [0, ${totalBeds}]` });
    }
    if (record.waitingPatients > 50 || record.waitingPatients < 0) {
      outliers.push({ field: 'waitingPatients', index: i, value: record.waitingPatients, reason: 'Out of range [0, 50]' });
    }
    if (record.availableBeds > totalBeds || record.availableBeds < 0) {
      outliers.push({ field: 'availableBeds', index: i, value: record.availableBeds, reason: `Out of range [0, ${totalBeds}]` });
    }
    if (record.averageWaitTime > 180 || record.averageWaitTime < 0) {
      outliers.push({ field: 'averageWaitTime', index: i, value: record.averageWaitTime, reason: 'Out of range [0, 180]' });
    }
  });
  return outliers;
}

export function validateTimestamps(data: EDRecord[]): number {
  let issues = 0;
  for (let i = 1; i < data.length; i++) {
    const curr = new Date(data[i].timestamp).getTime();
    const prev = new Date(data[i - 1].timestamp).getTime();
    if (curr < prev) {
      issues++;
    } else if (curr - prev > 2 * 60 * 60 * 1000) {
      issues++;
    }
  }
  return issues;
}

export function cleanData(data: EDRecord[]): EDRecord[] {
  if (data.length === 0) return [];
  const cleaned = data.map(r => ({ ...r }));
  const numericFields: (keyof EDRecord)[] = ['arrivals', 'currentOccupancy', 'waitingPatients', 'availableBeds', 'averageWaitTime'];
  
  const outliers = detectOutliers(cleaned);
  const outlierMap = new Set(outliers.map(o => `${o.index}-${o.field}`));

  for (let i = 0; i < cleaned.length; i++) {
    for (const field of numericFields) {
      const isMissing = cleaned[i][field] === null || cleaned[i][field] === undefined || Number.isNaN(cleaned[i][field]);
      const isOutlier = outlierMap.has(`${i}-${field}`);

      if (isMissing || isOutlier) {
        // Last known good value
        let fallbackVal = 0;
        for (let j = i - 1; j >= 0; j--) {
          const val = cleaned[j][field];
          if (val !== null && val !== undefined && !Number.isNaN(val) && !outlierMap.has(`${j}-${field}`)) {
            fallbackVal = Number(val);
            break;
          }
        }
        (cleaned[i][field] as any) = fallbackVal;
      }
    }
  }
  return cleaned;
}

export function assessDataQuality(data: EDRecord[]): DataQualityReport {
  const totalRecords = data.length;
  const outliers = detectOutliers(data);
  const timestampIssues = validateTimestamps(data);

  let missingValueCount = 0;
  const missingFieldMap: Record<string, number> = {};
  const numericFields: (keyof EDRecord)[] = ['arrivals', 'currentOccupancy', 'waitingPatients', 'availableBeds', 'averageWaitTime'];
  let validRecordsCount = 0;

  data.forEach((record, i) => {
    let hasMissing = false;
    for (const field of numericFields) {
      const val = record[field];
      if (val === null || val === undefined || Number.isNaN(val)) {
        hasMissing = true;
        missingValueCount++;
        missingFieldMap[field] = (missingFieldMap[field] || 0) + 1;
      }
    }
    const hasOutlier = outliers.some(o => o.index === i);
    if (!hasMissing && !hasOutlier) {
      validRecordsCount++;
    }
  });

  const missingFields = Object.entries(missingFieldMap).map(([field, count]) => ({ field, count }));
  const totalExpectedFields = totalRecords * numericFields.length;
  const validFields = totalExpectedFields - missingValueCount;
  const completenessPercent = totalExpectedFields === 0 ? 0 : (validFields / totalExpectedFields) * 100;

  const missingPct = totalExpectedFields === 0 ? 0 : (missingValueCount / totalExpectedFields) * 100;
  const outlierPct = totalExpectedFields === 0 ? 0 : (outliers.length / totalExpectedFields) * 100;
  const timestampIssuePct = totalRecords <= 1 ? 0 : (timestampIssues / (totalRecords - 1)) * 100;

  let qualityScore = 100 - (missingPct * 2) - (outlierPct * 3) - (timestampIssuePct * 2);
  qualityScore = Math.max(0, Math.min(100, qualityScore));

  let overallQuality: 'good' | 'acceptable' | 'degraded' | 'poor' = 'good';
  if (qualityScore < 40) overallQuality = 'poor';
  else if (qualityScore < 70) overallQuality = 'degraded';
  else if (qualityScore < 90) overallQuality = 'acceptable';

  const warnings: string[] = [];
  if (missingValueCount > 0) warnings.push(`${missingValueCount} missing values detected.`);
  if (outliers.length > 0) warnings.push(`${outliers.length} outliers detected.`);
  if (timestampIssues > 0) warnings.push(`${timestampIssues} timestamp issues detected.`);

  const canRunModel = qualityScore > 40 && validRecordsCount > 24;
  let fallbackReason = null;
  if (!canRunModel) {
    if (validRecordsCount <= 24) fallbackReason = 'Insufficient valid historical data (need at least 24 valid records).';
    else fallbackReason = 'Data quality score is too low to run reliable predictive models.';
  }

  return {
    totalRecords,
    validRecords: validRecordsCount,
    completenessPercent,
    missingValueCount,
    missingFields,
    outlierCount: outliers.length,
    outliers,
    timestampIssues,
    overallQuality,
    qualityScore,
    warnings,
    canRunModel,
    fallbackReason,
  };
}
