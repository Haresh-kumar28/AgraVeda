import { useMemo } from 'react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Users, Clock } from 'lucide-react';
import { ForecastPoint } from '../engines/forecastEngine';
import { EDRecord } from '../data/syntheticData';

interface WaitingTrendChartProps {
  forecast: ForecastPoint[];
  currentRecord: EDRecord;
  recentData: EDRecord[];
}

export default function WaitingTrendChart({ forecast, currentRecord, recentData }: WaitingTrendChartProps) {
  const chartData = useMemo(() => {
    const data: { label: string; actual: number | null; projected: number | null }[] = [];

    // Actual Data (Last 8 hours)
    const recent = recentData.slice(-8);
    for (const r of recent) {
      data.push({
        label: `${r.hour}:00`,
        actual: r.waitingPatients,
        projected: null,
      });
    }

    // Bridge point
    if (recent.length > 0) {
      const lastVal = recent[recent.length - 1].waitingPatients;
      data[data.length - 1] = { ...data[data.length - 1], projected: lastVal };
    }

    // Projected Data
    for (const f of forecast) {
      data.push({
        label: `+${f.hoursAhead}h`,
        actual: null,
        projected: f.predictedWaiting,
      });
    }

    return data;
  }, [recentData, forecast]);

  const currentWaiting = currentRecord.waitingPatients;
  const projectedPeak = forecast.length > 0
    ? Math.max(...forecast.map(f => f.predictedWaiting))
    : currentWaiting;
  const avgWaitTime = currentRecord.averageWaitTime;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Waiting Queue Trend</h3>
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#334155" />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#334155" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value: unknown) => [Math.round(Number(value)), 'Patients']}
            />
            <ReferenceLine y={10} stroke="#64748b" strokeDasharray="4 4" label={{ value: 'Target', position: 'insideTopLeft', fill: '#94a3b8', fontSize: 9 }} />
            <Bar dataKey="actual" fill="#60a5fa" radius={[3, 3, 0, 0]} maxBarSize={30} />
            <Line type="monotone" dataKey="projected" stroke="#fbbf24" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: '#fbbf24' }} connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200">
        <div className="text-center">
          <div className="text-[10px] text-slate-500 uppercase">Current Queue</div>
          <div className={`text-lg font-bold ${currentWaiting > 15 ? 'text-red-700' : currentWaiting > 8 ? 'text-orange-700' : 'text-slate-900'}`}>
            {currentWaiting}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 uppercase">Peak Projected</div>
          <div className={`text-lg font-bold ${projectedPeak > 15 ? 'text-red-700' : projectedPeak > 8 ? 'text-orange-700' : 'text-emerald-700'}`}>
            {Math.round(projectedPeak)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
            <Clock className="w-2.5 h-2.5" /> Avg Wait
          </div>
          <div className={`text-lg font-bold ${avgWaitTime > 45 ? 'text-red-700' : avgWaitTime > 25 ? 'text-orange-700' : 'text-slate-900'}`}>
            {avgWaitTime}m
          </div>
        </div>
      </div>
    </div>
  );
}
