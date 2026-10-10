import { DataQualityReport } from '../../engines/dataQualityEngine';
import { ForecastResult } from '../../engines/forecastEngine';
import { ShieldCheck, AlertTriangle, Database, Activity, CheckCircle2, Info } from 'lucide-react';

interface DataQualityPageProps {
  report: DataQualityReport;
  forecast: ForecastResult;
}

export default function DataQualityPage({ report, forecast }: DataQualityPageProps) {
  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'good':
        return 'text-[#0E7A4E] bg-[#ECFDF3] border-[#A6F4C5]';
      case 'acceptable':
        return 'text-[#B54708] bg-[#FFFAEB] border-[#FEDF89]';
      case 'degraded':
        return 'text-[#B54708] bg-[#FFFAEB] border-[#FEDF89]';
      case 'poor':
        return 'text-[#B42318] bg-[#FEF3F2] border-[#FECDCA]';
      default:
        return 'text-[#727272] bg-[#F8F9FA] border-[#EAEAEA]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#1B74E4]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#222222]">
              Data Quality & Model Trustworthiness
            </h1>
          </div>
          <p className="text-xs text-[#727272] mt-1">
            Audit input completeness, missingness, timestamp alignment, and heuristic fallback thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#1B74E4] bg-[#EAF4FF] border border-[#B2DDFF] px-2.5 py-1 rounded font-bold uppercase tracking-wider">
            Synthetic Operational Dataset
          </span>
        </div>
      </div>

      {/* Quality Overview Card */}
      <div className="p-6 bg-white border border-[#EAEAEA] rounded-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#1B74E4]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#222222]">
              Automated Data Audit Scorecard
            </h2>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getQualityBadge(
              report.overallQuality
            )}`}
          >
            Quality: {report.overallQuality}
          </span>
        </div>

        {/* Quality Score Bar */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-[#727272]">Aggregate Quality Index</span>
            <span className="font-bold font-mono text-[#222222]">
              {report.qualityScore.toFixed(0)} / 100
            </span>
          </div>
          <div className="w-full bg-[#F8F9FA] h-2 rounded-full overflow-hidden border border-[#EAEAEA]">
            <div
              className={`h-full ${
                report.qualityScore > 80
                  ? 'bg-[#0E7A4E]'
                  : report.qualityScore > 60
                  ? 'bg-[#B54708]'
                  : 'bg-[#B42318]'
              }`}
              style={{ width: `${report.qualityScore}%` }}
            />
          </div>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-[#F8F9FA] rounded border border-[#EAEAEA]">
            <div className="text-[10px] uppercase font-bold text-[#727272]">Completeness</div>
            <div className="text-2xl font-bold text-[#222222] mt-1">
              {report.completenessPercent.toFixed(1)}%
            </div>
          </div>
          <div className="p-3 bg-[#F8F9FA] rounded border border-[#EAEAEA]">
            <div className="text-[10px] uppercase font-bold text-[#727272]">Missing Values</div>
            <div
              className={`text-2xl font-bold mt-1 ${
                report.missingValueCount > 0 ? 'text-[#B54708]' : 'text-[#0E7A4E]'
              }`}
            >
              {report.missingValueCount}
            </div>
          </div>
          <div className="p-3 bg-[#F8F9FA] rounded border border-[#EAEAEA]">
            <div className="text-[10px] uppercase font-bold text-[#727272]">Outliers Detected</div>
            <div
              className={`text-2xl font-bold mt-1 ${
                report.outlierCount > 0 ? 'text-[#B54708]' : 'text-[#0E7A4E]'
              }`}
            >
              {report.outlierCount}
            </div>
          </div>
          <div className="p-3 bg-[#F8F9FA] rounded border border-[#EAEAEA]">
            <div className="text-[10px] uppercase font-bold text-[#727272]">Timestamp Skew</div>
            <div
              className={`text-2xl font-bold mt-1 ${
                report.timestampIssues > 0 ? 'text-[#B42318]' : 'text-[#0E7A4E]'
              }`}
            >
              {report.timestampIssues}
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-[#F8F9FA] rounded border border-[#EAEAEA] flex items-center justify-between text-xs">
          <div>
            <span className="text-[#727272] block">Pipeline Readiness Status</span>
            <span className="font-bold text-[#222222] text-sm">
              {report.canRunModel ? 'Primary Engine Active' : `Fallback Active: ${report.fallbackReason}`}
            </span>
          </div>
          {report.canRunModel ? (
            <CheckCircle2 className="w-5 h-5 text-[#0E7A4E]" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-[#B42318]" />
          )}
        </div>
      </div>

      {report.warnings.length > 0 && (
        <div className="p-4 bg-[#FFFAEB] border border-[#FEDF89] rounded-md text-xs text-[#B54708] flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider text-[10px]">Data Quality Warnings</span>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              {report.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Model Transparency & MVP Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-white border border-[#EAEAEA] rounded-md space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#1B74E4]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#222222]">
              Model Transparency & Verification
            </h2>
          </div>

          <div className="divide-y divide-[#EAEAEA] text-xs">
            <div className="flex justify-between py-2">
              <span className="text-[#727272]">Forecasting Architecture</span>
              <strong className="text-[#222222]">Temporal Hybrid Heuristic</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#727272]">Forecast Horizon</span>
              <strong className="text-[#222222]">1 to 6 Hours</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#727272]">Historical Validation (MAE)</span>
              <strong className="text-[#222222]">{forecast.metrics.mae.toFixed(2)} pts/hr</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#727272]">Root Mean Square Error (RMSE)</span>
              <strong className="text-[#222222]">{forecast.metrics.rmse.toFixed(2)} pts/hr</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#727272]">Dataset Provenance</span>
              <span className="font-semibold text-[#1B74E4]">Synthetic Benchmark (14 Days)</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border border-[#EAEAEA] rounded-md space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0E7A4E]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#222222]">
              Real-World Production Prerequisites
            </h2>
          </div>

          <div className="space-y-2 text-xs text-[#727272] leading-relaxed">
            <p>
              Before AgraVeda can be certified for live hospital operational control:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#222222]">
              <li>Bilateral HL7 v2 / FHIR ADT stream integration.</li>
              <li>Facility-specific model calibration against historical patient volume.</li>
              <li>Role authorization tied to institutional Single Sign-On (SAML / OIDC).</li>
              <li>Prospective operational validation with department leadership.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
