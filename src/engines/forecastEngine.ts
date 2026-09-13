import { EDRecord } from '../data/syntheticData';

export interface ForecastPoint {
  hoursAhead: number;
  predictedArrivals: number;
  predictedOccupancy: number;
  predictedWaiting: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface ForecastResult {
  forecasts: ForecastPoint[];
  drivers: ForecastDriver[];
  mae: number;
  rmse: number;
  metrics: { mae: number; rmse: number };
}

export interface ForecastDriver {
  factor: string;
  direction: 'up' | 'down' | 'neutral';
  impact: 'high' | 'medium' | 'low';
}

export function generateForecast(data: EDRecord[], currentRecord: EDRecord, scenario: string): ForecastResult {
  const forecasts: ForecastPoint[] = [];
  const horizons = [1, 2, 3, 4, 6];
  const totalBeds = currentRecord.totalBeds;
  
  let currentOccupancy = currentRecord.currentOccupancy;
  let currentWaiting = currentRecord.waitingPatients;
  
  horizons.forEach(h => {
    const targetHour = (currentRecord.hour + h) % 24;
    
    // Historical avg
    const matchingRecords = data.filter(r => r.hour === targetHour && r.isWeekend === currentRecord.isWeekend);
    const histAvg = matchingRecords.length > 0 
      ? matchingRecords.reduce((sum, r) => sum + r.arrivals, 0) / matchingRecords.length 
      : currentRecord.arrivals;
      
    // Recent trend (last 3 hours)
    const recent = data.slice(Math.max(data.length - 3, 0));
    const recentTrend = recent.length > 0 
      ? recent.reduce((sum, r) => sum + r.arrivals, 0) / recent.length 
      : currentRecord.arrivals;
      
    let predictedArrivals = 0.4 * histAvg + 0.35 * recentTrend + 0.25 * currentRecord.arrivals;
    
    if (scenario === 'accident_surge') predictedArrivals *= 1.6;
    else if (scenario === 'weekend_peak') predictedArrivals *= 0.85;
    
    predictedArrivals *= Math.pow(0.98, h);
    predictedArrivals = Math.max(1, Math.min(30, Math.round(predictedArrivals)));
    
    const estimatedDepartures = Math.round(0.75 * predictedArrivals);
    currentOccupancy = currentOccupancy + predictedArrivals - estimatedDepartures;
    currentOccupancy = Math.max(0, Math.min(totalBeds, Math.round(currentOccupancy)));
    
    let predictedWaiting = 0;
    if (currentOccupancy > 0.8 * totalBeds) {
      predictedWaiting = Math.round((currentOccupancy - 0.8 * totalBeds) * 2);
    } else {
      predictedWaiting = Math.max(0, currentWaiting - 2);
    }
    
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (h <= 2) confidence = 'high';
    else if (h <= 4) confidence = 'medium';
    
    forecasts.push({
      hoursAhead: h,
      predictedArrivals,
      predictedOccupancy: currentOccupancy,
      predictedWaiting,
      confidence
    });
  });
  
  // Backtesting for MAE / RMSE on last 24h
  let mae = 0;
  let rmse = 0;
  const testWindow = data.slice(Math.max(data.length - 24, 0));
  const trainData = data.slice(0, Math.max(data.length - 24, 0));
  if (trainData.length > 0 && testWindow.length > 0) {
    let sumAbsErr = 0;
    let sumSqErr = 0;
    testWindow.forEach(rec => {
      const matchRecs = trainData.filter(r => r.hour === rec.hour && r.isWeekend === rec.isWeekend);
      const hAvg = matchRecs.length > 0 ? matchRecs.reduce((s, r) => s + r.arrivals, 0) / matchRecs.length : rec.arrivals;
      const pred = Math.round(0.4 * hAvg + 0.35 * rec.arrivals + 0.25 * rec.arrivals);
      const err = Math.abs(pred - rec.arrivals);
      sumAbsErr += err;
      sumSqErr += err * err;
    });
    mae = parseFloat((sumAbsErr / testWindow.length).toFixed(1));
    rmse = parseFloat(Math.sqrt(sumSqErr / testWindow.length).toFixed(1));
  }
  
  // Drivers
  const drivers: ForecastDriver[] = [];
  const recent3 = data.slice(Math.max(data.length - 3, 0));
  const recentAvg = recent3.reduce((s, r) => s + r.arrivals, 0) / 3;
  const sameHour = data.filter(r => r.hour === currentRecord.hour);
  const histHourAvg = sameHour.reduce((s, r) => s + r.arrivals, 0) / sameHour.length;
  
  if (recentAvg > histHourAvg * 1.1) {
    drivers.push({ factor: 'Recent arrivals', direction: 'up', impact: 'high' });
  }
  if (currentRecord.hour >= 10 && currentRecord.hour <= 16) {
    drivers.push({ factor: 'Peak hours pattern', direction: 'up', impact: 'medium' });
  }
  if (currentRecord.isWeekend) {
    drivers.push({ factor: 'Weekend effect', direction: 'down', impact: 'medium' });
  }
  if (currentRecord.currentOccupancy / currentRecord.totalBeds > 0.75) {
    drivers.push({ factor: 'Current high occupancy', direction: 'up', impact: 'high' });
  }
  
  return { forecasts, drivers, mae, rmse, metrics: { mae, rmse } };
}
