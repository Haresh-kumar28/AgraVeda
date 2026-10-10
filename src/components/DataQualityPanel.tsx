import { Database, AlertCircle, CheckCircle } from 'lucide-react';
import { DataQualityReport } from '../engines/dataQualityEngine';

interface DataQualityPanelProps {
  report: DataQualityReport;
}

export default function DataQualityPanel({ report }: DataQualityPanelProps) {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'good': return 'text-emerald-700 bg-emerald-50 border-emerald-500/20';
      case 'acceptable': return 'text-amber-700 bg-yellow-400/10 border-yellow-500/20';
      case 'degraded': return 'text-orange-700 bg-orange-400/10 border-orange-500/20';
      case 'poor': return 'text-red-700 bg-red-400/10 border-red-500/20';
      default: return 'text-slate-500 bg-slate-400/10 border-slate-500/20';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Data Quality & Model Status</h3>
        </div>
        <div className={`px-2 py-1 rounded border text-xs font-bold uppercase tracking-wider ${getQualityColor(report.overallQuality)}`}>
          {report.overallQuality}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">Quality Score</span>
          <span className="text-slate-800 font-semibold">{report.qualityScore.toFixed(0)} / 100</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full ${report.qualityScore >= 90 ? 'bg-emerald-500' : report.qualityScore >= 70 ? 'bg-yellow-500' : report.qualityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'}`} 
            style={{ width: `${report.qualityScore}%` }} 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-100 p-2 rounded flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Completeness</span>
          <span className="text-slate-800 font-medium text-sm">{report.completenessPercent.toFixed(1)}%</span>
        </div>
        <div className="bg-slate-100 p-2 rounded flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Missing Values</span>
          <span className="text-slate-800 font-medium text-sm">{report.missingValueCount}</span>
        </div>
        <div className="bg-slate-100 p-2 rounded flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Outliers</span>
          <span className="text-slate-800 font-medium text-sm">{report.outlierCount}</span>
        </div>
        <div className="bg-slate-100 p-2 rounded flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Timestamp Issues</span>
          <span className="text-slate-800 font-medium text-sm">{report.timestampIssues}</span>
        </div>
      </div>

      <div className="mb-4 flex-1">
        <h4 className="text-xs font-semibold text-slate-700 mb-2">Model Status</h4>
        {report.canRunModel ? (
          <div className="flex items-start gap-2 text-emerald-700 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Ready. Sufficient valid historical data to generate predictions.</span>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Fallback: {report.fallbackReason}</span>
          </div>
        )}
      </div>

      {report.warnings.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-slate-700 mb-2">Warnings</h4>
          <ul className="text-xs text-amber-700 space-y-1">
            {report.warnings.slice(0, 2).map((w, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="shrink-0">•</span> <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto pt-3 border-t border-slate-200">
        <p className="text-[10px] text-slate-500 leading-tight">
          Real-world hospital data may contain missing values, delayed records, inconsistent timestamps, and outliers. Our MVP includes validation, missing-value handling, and outlier detection.
        </p>
      </div>
    </div>
  );
}
