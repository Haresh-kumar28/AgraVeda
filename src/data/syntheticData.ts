export interface EDRecord {
  timestamp: string; // ISO string
  hour: number; // 0-23
  dayOfWeek: number; // 0-6 (0=Sunday)
  isWeekend: boolean;
  arrivals: number;
  departures: number;
  currentOccupancy: number;
  waitingPatients: number;
  availableBeds: number;
  totalBeds: number; // always 40
  doctorsAvailable: number;
  nursesAvailable: number;
  diagnosticQueue: number;
  averageWaitTime: number; // minutes
  highAcuity: number;
  mediumAcuity: number;
  lowAcuity: number;
  scenario: 'normal' | 'accident_surge' | 'weekend_peak';
}

function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
const random = mulberry32(42);

export function generateSyntheticData(): EDRecord[] {
  const records: EDRecord[] = [];
  const totalBeds = 40;
  let currentOccupancy = 20;
  
  // Starting timestamp 14 days ago
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const startTime = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  for (let i = 0; i < 336; i++) {
    const time = new Date(startTime.getTime() + i * 60 * 60 * 1000);
    const hour = time.getHours();
    const dayOfWeek = time.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Patterns
    let baseArrivals = 5;
    if (hour >= 2 && hour <= 5) baseArrivals = 3;
    else if (hour >= 6 && hour <= 10) baseArrivals = 8;
    else if (hour >= 11 && hour <= 18) baseArrivals = 15;
    else if (hour >= 19 && hour <= 23) baseArrivals = 10;
    
    // Add noise
    let arrivals = Math.round(baseArrivals + (random() * 4 - 2));
    if (isWeekend) arrivals = Math.round(arrivals * 0.85);
    if (arrivals < 0) arrivals = 0;
    
    let departures = Math.round(arrivals * (0.7 + random() * 0.2)); 
    
    currentOccupancy = currentOccupancy + arrivals - departures;
    if (currentOccupancy > 38) currentOccupancy = 38;
    if (currentOccupancy < 5) currentOccupancy = 5;
    
    const occupancyRatio = currentOccupancy / totalBeds;
    let waitingPatients = Math.round(occupancyRatio * 15 * random());
    if (occupancyRatio > 0.8) waitingPatients += Math.round(random() * 10);
    
    const availableBeds = totalBeds - Math.round(currentOccupancy * 0.85);
    
    let doctorsAvailable = 4;
    let nursesAvailable = 7;
    if (hour >= 7 && hour <= 15) { doctorsAvailable = 9; nursesAvailable = 16; }
    else if (hour >= 16 && hour <= 23) { doctorsAvailable = 7; nursesAvailable = 12; }
    
    let diagnosticQueue = Math.round((arrivals * 0.3) + random() * 3);
    if (occupancyRatio > 0.8) diagnosticQueue += 2;
    
    let averageWaitTime = Math.round(10 + occupancyRatio * 50 + random() * 10);
    if (averageWaitTime > 120) averageWaitTime = 120;
    
    const highAcuity = Math.round(arrivals * 0.2);
    const lowAcuity = Math.round(arrivals * 0.35);
    const mediumAcuity = arrivals - highAcuity - lowAcuity;
    
    let scenario: 'normal' | 'accident_surge' | 'weekend_peak' = 'normal';
    if (isWeekend && hour >= 12 && hour <= 18) {
        scenario = 'weekend_peak';
    } else if (random() > 0.95) {
        scenario = 'accident_surge';
        arrivals += Math.round(random() * 5 + 5); // surge
    }

    records.push({
      timestamp: time.toISOString(),
      hour,
      dayOfWeek,
      isWeekend,
      arrivals,
      departures,
      currentOccupancy,
      waitingPatients,
      availableBeds,
      totalBeds,
      doctorsAvailable,
      nursesAvailable,
      diagnosticQueue,
      averageWaitTime,
      highAcuity,
      mediumAcuity,
      lowAcuity,
      scenario
    });
  }
  return records;
}

export function getLatestRecord(data: EDRecord[]): EDRecord {
  return data[data.length - 1];
}

export function getRecentRecords(data: EDRecord[], hours: number): EDRecord[] {
  return data.slice(Math.max(data.length - hours, 0));
}

export const syntheticData = generateSyntheticData();
