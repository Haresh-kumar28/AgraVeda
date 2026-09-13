import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ForecastResult } from '../engines/forecastEngine';
import { EDRecord } from '../data/syntheticData';
import { TrendingUp } from 'lucide-react';

interface ForecastChartProps {
  forecast: ForecastResult;
  recentData: EDRecord[];
  scenario: string;
}

export default function ForecastChart({ forecast, recentData, scenario }: ForecastChartProps) {
  // Combine recent actual data with forecast
  const chartData: {label:string; actual:number|null; predicted:number|null; hour:number; index:number}[] = [
    ...recentData.slice(-8).map((r, i) => ({
      label: `${r.hour}:00`,
      actual: r.arrivals,
      predicted: null as number | null,
      hour: r.hour,
      index: i,
    })),
    ...forecast.forecasts.map((f, i) => ({
      label: `+${f.hoursAhead}h`,
      actual: null as number | null,
      predicted: f.predictedArrivals,
      hour: (recentData[recentData.length - 1]?.hour + f.hoursAhead) % 24,
      index: recentData.slice(-8).length + i,
    })),
  ];

  // Bridge point: last actual becomes first predicted for visual continuity
  if (chartData.length > 0) {
    const lastActualIdx = recentData.slice(-8).length - 1;
    if (lastActualIdx >= 0 && lastActualIdx < chartData.length) {
      chartData[lastActualIdx] = {
        ...chartData[lastActualIdx],
        predicted: chartData[lastActualIdx].actual,
      };
    }
  }

  return (
    <div className="rounded-xl bg-white/70 border border-slate-100 p-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">Patient Arrival Forecast</h3>
          {scenario === 'accident_surge' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-700 border border-red-200">
              SURGE ACTIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded bg-blue-400"></div>
            <span className="text-slate-500">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded bg-amber-400"></div>
            <span className="text-slate-500">Predicted</span>
          </div>
        </div>
      </div>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8edf3" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#cbd5e1" />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#cbd5e1" />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: '#64748b' }}
            />
            <ReferenceLine x={chartData[recentData.slice(-8).length - 1]?.label} stroke="#475569" strokeDasharray="4 4" label={{ value: 'Now', position: 'top', fill: '#94a3b8', fontSize: 10 }} />
            <Area type="monotone" dataKey="actual" stroke="#60a5fa" fill="url(#actualGrad)" strokeWidth={2} dot={{ r: 2, fill: '#60a5fa' }} connectNulls={false} />
            <Area type="monotone" dataKey="predicted" stroke="#fbbf24" fill="url(#predGrad)" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 2, fill: '#fbbf24' }} connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast summary row */}
      <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-slate-200">
        {forecast.forecasts.map((f) => (
          <div key={f.hoursAhead} className="text-center">
            <div className="text-[10px] text-slate-500 uppercase">+{f.hoursAhead}h</div>
            <div className="text-sm font-bold text-slate-900">{f.predictedArrivals}</div>
            <div className={`text-[10px] ${f.confidence === 'high' ? 'text-emerald-700' : f.confidence === 'medium' ? 'text-amber-700' : 'text-slate-500'}`}>
              {f.confidence}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
