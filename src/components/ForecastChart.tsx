import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ForecastResult, ForecastPoint } from '../engines/forecastEngine';
import { EDRecord } from '../data/syntheticData';
import { TrendingUp, Info } from 'lucide-react';

interface ForecastChartProps {
  forecast: ForecastResult;
  recentData: EDRecord[];
  scenario: string;
}

interface ChartDataPoint {
  label: string;
  timeLabel: string;
  isForecast: boolean;
  actual: number | null;
  predicted: number | null;
  predUpper?: number | null;
  predLower?: number | null;
  hoursAhead?: number;
  confidence?: 'high' | 'medium' | 'low';
  predictedOccupancy?: number;
  predictedWaiting?: number;
  hour: number;
}

export default function ForecastChart({ forecast, recentData, scenario }: ForecastChartProps) {
  const currentRecord = recentData[recentData.length - 1];
  const currentHour = currentRecord ? currentRecord.hour : 12;

  // Build sequential chart data
  const chartData: ChartDataPoint[] = [
    ...recentData.slice(-8).map((r) => {
      const hh = r.hour.toString().padStart(2, '0');
      return {
        label: `${hh}:00`,
        timeLabel: `${hh}:00 (Recorded Actual)`,
        isForecast: false,
        actual: r.arrivals,
        predicted: null as number | null,
        hour: r.hour,
      };
    }),
    ...forecast.forecasts.map((f: ForecastPoint) => {
      const targetHour = (currentHour + f.hoursAhead) % 24;
      const hh = targetHour.toString().padStart(2, '0');
      const upper = Math.round((f.predictedArrivals + forecast.mae) * 10) / 10;
      const lower = Math.max(0, Math.round((f.predictedArrivals - forecast.mae) * 10) / 10);
      return {
        label: `+${f.hoursAhead}h`,
        timeLabel: `${hh}:00 (+${f.hoursAhead}h Horizon)`,
        isForecast: true,
        actual: null as number | null,
        predicted: f.predictedArrivals,
        predUpper: upper,
        predLower: lower,
        hoursAhead: f.hoursAhead,
        confidence: f.confidence,
        predictedOccupancy: f.predictedOccupancy,
        predictedWaiting: f.predictedWaiting,
        hour: targetHour,
      };
    }),
  ];

  // Bridge point: last recorded actual becomes starting anchor for predicted line
  const lastActualIndex = recentData.slice(-8).length - 1;
  if (lastActualIndex >= 0 && lastActualIndex < chartData.length) {
    chartData[lastActualIndex] = {
      ...chartData[lastActualIndex],
      predicted: chartData[lastActualIndex].actual,
      predUpper: chartData[lastActualIndex].actual,
      predLower: chartData[lastActualIndex].actual,
    };
  }

  const nowLabel = chartData[lastActualIndex]?.label;

  return (
    <div className="space-y-4">
      {/* Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <TrendingUp className="w-4 h-4 text-[#1B74E4]" />
          <span className="text-xs font-bold text-[#1A1A1A]">
            Hourly Patient Arrival Pattern & Projection
          </span>
          {scenario === 'accident_surge' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]">
              Surge Scenario Active (+80%)
            </span>
          )}
          {scenario === 'weekend_peak' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]">
              Weekend Demand Cycle
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-[#6B6B6B]">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1.5 rounded-sm bg-[#1B74E4]" aria-hidden="true" />
            <span className="font-medium text-[#1A1A1A]">Observed (Last 8h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1.5 rounded-sm bg-[#D97706] border-b border-dashed border-[#D97706]" aria-hidden="true" />
            <span className="font-medium text-[#1A1A1A]">Model Forecast (6h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1.5 rounded-sm bg-[#D97706]/20 border border-[#D97706]/40" aria-hidden="true" />
            <span className="text-[11px] text-[#6B6B6B]">Uncertainty (±{forecast.mae})</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -20, bottom: 4 }}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B74E4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1B74E4" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D97706" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#D97706" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D97706" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#D97706" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DF" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#6B6B6B' }}
              stroke="#E8E4DF"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B6B6B' }}
              stroke="#E8E4DF"
              tickLine={false}
              domain={[0, 'dataMax + 6']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload as ChartDataPoint;
                return (
                  <div className="p-3 bg-white border border-[#E8E4DF] rounded-md shadow-md text-xs space-y-1.5 min-w-[210px]">
                    <div className="font-bold text-[#1A1A1A] pb-1 border-b border-[#E8E4DF] flex items-center justify-between">
                      <span>{data.timeLabel}</span>
                      <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                        data.isForecast ? 'bg-[#FFFAEB] text-[#B54708]' : 'bg-[#EAF4FF] text-[#1B74E4]'
                      }`}>
                        {data.isForecast ? 'Forecast' : 'Observed'}
                      </span>
                    </div>

                    {!data.isForecast && data.actual !== null && (
                      <div className="flex justify-between items-baseline pt-0.5">
                        <span className="text-[#6B6B6B]">Recorded Inflow:</span>
                        <strong className="text-[#1B74E4] font-mono text-sm">{data.actual} pts/hr</strong>
                      </div>
                    )}

                    {data.isForecast && data.predicted !== null && (
                      <>
                        <div className="flex justify-between items-baseline">
                          <span className="text-[#6B6B6B]">Projected Arrivals:</span>
                          <strong className="text-[#D97706] font-mono text-sm">{data.predicted} pts/hr</strong>
                        </div>
                        <div className="flex justify-between items-baseline text-[11px] text-[#6B6B6B]">
                          <span>Model Confidence:</span>
                          <span className="font-semibold text-[#1A1A1A] capitalize">{data.confidence}</span>
                        </div>
                        <div className="flex justify-between items-baseline text-[11px] text-[#6B6B6B]">
                          <span>MAE Uncertainty:</span>
                          <span className="font-mono text-[#1A1A1A]">±{forecast.mae} pts/hr</span>
                        </div>
                        {data.predictedOccupancy !== undefined && (
                          <div className="flex justify-between items-baseline text-[11px] text-[#6B6B6B] pt-1 border-t border-[#F5F3F0]">
                            <span>Projected Occupancy:</span>
                            <span className="font-mono font-bold text-[#1A1A1A]">{data.predictedOccupancy} beds</span>
                          </div>
                        )}
                        {data.predictedWaiting !== undefined && (
                          <div className="flex justify-between items-baseline text-[11px] text-[#6B6B6B]">
                            <span>Projected Queue:</span>
                            <span className="font-mono font-bold text-[#B42318]">{data.predictedWaiting} waiting</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              }}
            />
            {nowLabel && (
              <ReferenceLine
                x={nowLabel}
                stroke="#6B6B6B"
                strokeDasharray="4 4"
                label={{ value: 'T0 (Now)', position: 'top', fill: '#6B6B6B', fontSize: 10, fontWeight: 700 }}
              />
            )}
            {/* Confidence Interval Upper Band */}
            <Area
              type="monotone"
              dataKey="predUpper"
              name="Upper Bound (MAE)"
              stroke="transparent"
              fill="url(#ciGrad)"
              connectNulls={false}
            />
            {/* Recorded Actual Inflow */}
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
            {/* Predicted Inflow Horizon */}
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

      {/* Hourly Forecast Horizon Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-3 border-t border-[#E8E4DF]">
        {forecast.forecasts.map((f: ForecastPoint) => {
          const targetHour = (currentHour + f.hoursAhead) % 24;
          const hh = targetHour.toString().padStart(2, '0');
          const isHighConfidence = f.confidence === 'high';
          return (
            <div
              key={f.hoursAhead}
              className="p-2.5 rounded-md bg-[#FAFAF8] border border-[#E8E4DF] text-center space-y-1 transition-all hover:bg-white hover:border-[#B6B6B6]"
            >
              <div className="flex items-center justify-between text-[10px] text-[#6B6B6B]">
                <span className="font-bold uppercase tracking-wider text-[#1A1A1A]">+{f.hoursAhead}h</span>
                <span className="font-mono text-[10px] text-[#6B6B6B]">{hh}:00</span>
              </div>
              <div className="text-lg font-bold text-[#1A1A1A] font-mono tracking-tight">
                {f.predictedArrivals}
                <span className="text-xs font-normal text-[#6B6B6B] ml-0.5">/hr</span>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#E8E4DF]/60">
                <span className={isHighConfidence ? 'text-[#0E7A4E] font-medium' : 'text-[#B54708] font-medium'}>
                  {f.confidence} conf.
                </span>
                <span className="font-mono text-[#6B6B6B]">±{forecast.mae}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytical Provenance Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-[#6B6B6B]">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#1B74E4] shrink-0" />
          <span>
            Validation on 24h backtest: <strong>MAE ±{forecast.mae} arrivals/hr</strong> · <strong>RMSE {forecast.rmse}</strong>
          </span>
        </div>
        <span className="italic">
          Temporal blend: 40% matching cycle + 35% recent velocity + 25% current load
        </span>
      </div>
    </div>
  );
}
