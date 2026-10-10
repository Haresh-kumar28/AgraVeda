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
  const chartData: { label: string; actual: number | null; predicted: number | null; hour: number; index: number }[] = [
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

  // Bridge point: last actual becomes first predicted for smooth visual continuity
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#1B74E4]" />
          <span className="text-xs font-bold text-[#222222]">
            Hourly Patient Arrival Pattern
          </span>
          {scenario === 'accident_surge' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]">
              Surge Scenario Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-[#727272]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-[#1B74E4]"></span>
            <span>Recorded Arrivals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-[#D97706] border-b border-dashed border-[#D97706]"></span>
            <span>Model Forecast</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B74E4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1B74E4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D97706" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#727272' }}
              stroke="#EAEAEA"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#727272' }}
              stroke="#EAEAEA"
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #EAEAEA',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#222222',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
              labelStyle={{ fontWeight: 600, color: '#222222' }}
            />
            <ReferenceLine
              x={chartData[recentData.slice(-8).length - 1]?.label}
              stroke="#727272"
              strokeDasharray="4 4"
              label={{ value: 'Now', position: 'top', fill: '#727272', fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="actual"
              name="Actual Volume"
              stroke="#1B74E4"
              fill="url(#actualGrad)"
              strokeWidth={2}
              dot={{ r: 2.5, fill: '#1B74E4' }}
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              name="Predicted Volume"
              stroke="#D97706"
              fill="url(#predGrad)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 2.5, fill: '#D97706' }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly forecast strip */}
      <div className="grid grid-cols-6 gap-2 pt-3 border-t border-[#EAEAEA]">
        {forecast.forecasts.map((f) => (
          <div key={f.hoursAhead} className="text-center p-2 rounded bg-[#F8F9FA] border border-[#EAEAEA]">
            <div className="text-[10px] font-bold uppercase text-[#727272]">+{f.hoursAhead}h Horizon</div>
            <div className="text-base font-bold text-[#222222] mt-0.5">{f.predictedArrivals}</div>
            <div className="text-[10px] text-[#727272] mt-0.5 capitalize">
              {f.confidence} confidence
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
