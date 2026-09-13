import { Brain, TrendingUp, TrendingDown, Minus, Database } from 'lucide-react';
import { ForecastDriver } from '../engines/forecastEngine';

interface ForecastDriversProps {
  drivers: ForecastDriver[];
  mae: number;
  rmse: number;
}

const directionIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const directionColors = {
  up: 'text-red-700',
  down: 'text-emerald-700',
  neutral: 'text-slate-500',
};

const impactBadge = {
  high: 'bg-red-500/20 text-red-700',
  medium: 'bg-orange-50 text-orange-700',
  low: 'bg-slate-100 text-slate-600',
};

export default function ForecastDrivers({ drivers, mae, rmse }: ForecastDriversProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-violet-400" />
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Forecast Explainability</h3>
      </div>

      {/* Why is load expected to change? */}
      <p className="text-[10px] text-slate-500 uppercase font-medium mb-2">
        Why is load expected to change?
      </p>

      {drivers.length === 0 ? (
        <p className="text-xs text-slate-500 italic">No significant factors detected.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {drivers.map((d, i) => {
            const Icon = directionIcons[d.direction];
            return (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3 h-3 ${directionColors[d.direction]}`} />
                  <span className="text-xs text-slate-700">{d.factor}</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${impactBadge[d.impact]}`}>
                  {d.impact}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Model metrics */}
      <div className="border-t border-slate-200 pt-3 mt-3">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] text-slate-500 uppercase font-medium">Forecast Quality</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 rounded px-2 py-1.5">
            <div className="text-[10px] text-slate-500">MAE</div>
            <div className="text-sm font-bold text-slate-700">{mae} patients/hr</div>
          </div>
          <div className="bg-slate-50 rounded px-2 py-1.5">
            <div className="text-[10px] text-slate-500">RMSE</div>
            <div className="text-sm font-bold text-slate-700">{rmse} patients/hr</div>
          </div>
        </div>
        <p className="text-[9px] text-slate-500 mt-2 italic">
          Validated on last 24h of simulated data using temporal holdout.
        </p>
      </div>

      {/* Data quality note */}
      <div className="border-t border-slate-200 pt-3 mt-3">
        <p className="text-[10px] text-slate-500 uppercase font-medium mb-1">Data Quality Notes</p>
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">Data source</span>
            <span className="text-slate-500">Simulated (14 days)</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">Completeness</span>
            <span className="text-emerald-700">100%</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">Approach</span>
            <span className="text-slate-500">Hybrid Heuristic</span>
          </div>
        </div>
        <p className="text-[9px] text-slate-500 mt-2 italic">
          Real-world data may contain missing values, delayed records, and outliers. Our MVP includes validation and outlier handling.
        </p>
      </div>
    </div>
  );
}
