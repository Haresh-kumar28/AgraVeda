import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Activity, Clock } from 'lucide-react';
import { ForecastPoint } from '../engines/forecastEngine';
import { EDRecord } from '../data/syntheticData';

interface OccupancyProjectionChartProps {
  forecast: ForecastPoint[];
  currentRecord: EDRecord;
  recentData: EDRecord[];
}

export default function OccupancyProjectionChart({ forecast, currentRecord, recentData }: OccupancyProjectionChartProps) {
  const totalBeds = currentRecord.totalBeds;

  const chartData = useMemo(() => {
    const data: { label: string; actual: number | null; projected: number | null }[] = [];

    // Last 8 hours of actual occupancy
    const recent = recentData.slice(-8);
    for (const r of recent) {
      data.push({
        label: `${r.hour}:00`,
        actual: parseFloat(((r.currentOccupancy / totalBeds) * 100).toFixed(1)),
        projected: null,
      });
    }

    // Bridge: last actual point also appears as first projected
    if (recent.length > 0) {
      const last = recent[recent.length - 1];
      const lastPct = parseFloat(((last.currentOccupancy / totalBeds) * 100).toFixed(1));
      data[data.length - 1] = { ...data[data.length - 1], projected: lastPct };
    }

    // Projected occupancy from forecast
    for (const f of forecast) {
      data.push({
        label: `+${f.hoursAhead}h`,
        actual: null,
        projected: parseFloat(((f.predictedOccupancy / totalBeds) * 100).toFixed(1)),
      });
    }

    return data;
  }, [recentData, forecast, totalBeds]);

  const currentOccPct = (currentRecord.currentOccupancy / totalBeds) * 100;
  const projectedPeakPct = forecast.length > 0
    ? Math.max(...forecast.map(f => (f.predictedOccupancy / totalBeds) * 100))
    : currentOccPct;

  const thresholdHit = forecast.find(f => (f.predictedOccupancy / totalBeds) * 100 >= 85);
  const timeToThreshold = thresholdHit ? `+${thresholdHit.hoursAhead}h` : 'N/A';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Projected ED Occupancy</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded bg-blue-400"></div>
            <span className="text-slate-500">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded bg-amber-400"></div>
            <span className="text-slate-500">Projected</span>
          </div>
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="occActualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="occProjGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#334155" />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#334155" domain={[0, 120]} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value: unknown) => [`${Number(value).toFixed(1)}%`, 'Occupancy']}
            />
            <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Threshold (85%)', position: 'insideTopLeft', fill: '#ef4444', fontSize: 9 }} />
            <ReferenceLine y={100} stroke="#64748b" strokeDasharray="4 4" label={{ value: 'Max', position: 'insideTopLeft', fill: '#64748b', fontSize: 9 }} />
            <Area type="monotone" dataKey="actual" stroke="#60a5fa" fill="url(#occActualGrad)" strokeWidth={2} dot={{ r: 2, fill: '#60a5fa' }} connectNulls={false} />
            <Area type="monotone" dataKey="projected" stroke="#fbbf24" fill="url(#occProjGrad)" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 2, fill: '#fbbf24' }} connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200">
        <div className="text-center">
          <div className="text-[10px] text-slate-500 uppercase">Current</div>
          <div className={`text-lg font-bold ${currentOccPct > 85 ? 'text-red-700' : 'text-slate-900'}`}>
            {currentOccPct.toFixed(0)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 uppercase">Peak Projected</div>
          <div className={`text-lg font-bold ${projectedPeakPct > 85 ? 'text-red-700' : projectedPeakPct > 70 ? 'text-orange-700' : 'text-emerald-700'}`}>
            {projectedPeakPct.toFixed(0)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
            <Clock className="w-2.5 h-2.5" /> To Threshold
          </div>
          <div className={`text-lg font-bold ${timeToThreshold !== 'N/A' ? 'text-orange-700' : 'text-slate-500'}`}>
            {timeToThreshold}
          </div>
        </div>
      </div>
    </div>
  );
}
