import React from 'react';
import { DataQualityReport } from '../../engines/dataQualityEngine';
import { ForecastResult } from '../../engines/forecastEngine';
import { ShieldCheck, AlertTriangle, Database, Activity, CheckCircle, Info } from 'lucide-react';

interface DataQualityPageProps {
  report: DataQualityReport;
  forecast: ForecastResult;
}

export default function DataQualityPage({
  report,
  forecast
}: DataQualityPageProps) {
  
  const getQualityColor = (quality: string) => {
    switch(quality) {
      case 'good': return 'text-emerald-700 bg-emerald-50 border-green-500/30';
      case 'acceptable': return 'text-amber-700 bg-amber-50 border-yellow-500/30';
      case 'degraded': return 'text-orange-700 bg-orange-50 border-orange-500/30';
      case 'poor': return 'text-red-700 bg-red-500/20 border-red-200';
      default: return 'text-slate-500 bg-slate-500/20 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 text-slate-900 p-6 h-full overflow-y-auto">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Data Quality</h1>
          <p className="text-slate-500">How reliable are the inputs?</p>
        </div>
        <div className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/40 text-blue-600 text-sm font-bold rounded flex items-center">
          <Database className="w-4 h-4 mr-2" />
          SIMULATED DATA
        </div>
      </header>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Quality Overview
          </h2>
          <span className={`px-3 py-1 rounded text-sm font-bold border uppercase tracking-wider ${getQualityColor(report.overallQuality)}`}>
            {report.overallQuality}
          </span>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">Overall Quality Score</span>
            <span className="font-bold">{report.qualityScore.toFixed(0)} / 100</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                report.qualityScore > 80 ? 'bg-green-500' :
                report.qualityScore > 60 ? 'bg-yellow-500' :
                report.qualityScore > 40 ? 'bg-orange-500' : 'bg-red-500'
              }`} 
              style={{ width: `${report.qualityScore}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Completeness</div>
            <div className="text-2xl font-bold">{report.completenessPercent.toFixed(1)}%</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Missing Values</div>
            <div className={`text-2xl font-bold ${report.missingValueCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {report.missingValueCount}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Outliers</div>
            <div className={`text-2xl font-bold ${report.outlierCount > 0 ? 'text-orange-700' : 'text-emerald-700'}`}>
              {report.outlierCount}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Timestamp Issues</div>
            <div className={`text-2xl font-bold ${report.timestampIssues > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
              {report.timestampIssues}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-sm block mb-1">Model Status</span>
            <span className="font-semibold text-lg">
              {report.canRunModel ? 'Ready' : `Fallback: ${report.fallbackReason}`}
            </span>
          </div>
          {report.canRunModel ? <CheckCircle className="text-green-500 w-8 h-8" /> : <AlertTriangle className="text-red-500 w-8 h-8" />}
        </div>
      </div>

      {report.warnings.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-yellow-500 font-semibold mb-1">Data Quality Warnings</h3>
            <ul className="list-disc pl-4 text-sm text-amber-700/80 space-y-1">
              {report.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-rose-400" />
            Real-World Data Challenges
          </h2>
          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
            <li><strong>Missing arrivals:</strong> Registration delays cause patients to appear later in the system.</li>
            <li><strong>Delayed records:</strong> System sync intervals can delay up-to-date occupancy numbers.</li>
            <li><strong>Inconsistent timestamps:</strong> Clocks across different hospital systems may not align perfectly.</li>
            <li><strong>Outliers:</strong> Typos in manual entry can lead to physically impossible values.</li>
            <li><strong>Incomplete resource data:</strong> Staffing levels are often tracked in separate, siloed systems.</li>
            <li><strong>Changing definitions:</strong> What constitutes a "bed" might vary during crisis mode.</li>
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-emerald-700" />
            MVP Safeguards
          </h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Missing-value detection</li>
            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Basic missing-value handling (Last Observation Carried Forward)</li>
            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Numeric/range validation</li>
            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Timestamp validation</li>
            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Outlier detection</li>
            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Data completeness score</li>
            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Simulated-data labeling</li>
            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Safe fallback heuristic when data is too poor</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-600" />
            Model Transparency
          </h2>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Model Architecture</span>
              <span className="font-medium">Hybrid Heuristic</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Forecast Horizon</span>
              <span className="font-medium">1-6 hours</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Primary Inputs</span>
              <span className="font-medium text-right">Time, Current Demand, Historical Demand, Resource Capacity</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Validation (MAE)</span>
              <span className="font-medium">{forecast.mae} patients/hr</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Validation (RMSE)</span>
              <span className="font-medium">{forecast.rmse} patients/hr</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Training Data Source</span>
              <span className="font-medium text-blue-600">SIMULATED / DEMO</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">MVP Limitations</h2>
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <strong className="text-slate-800 block mb-1">Current MVP includes:</strong>
              <p className="text-slate-500">Heuristic forecasting based on structured synthetic data, deterministic what-if simulator, basic data quality checks.</p>
            </div>
            <div>
              <strong className="text-slate-800 block mb-1">Future production capabilities required:</strong>
              <ul className="list-disc pl-5 text-slate-500 space-y-1 mt-1">
                <li>Real hospital EMR/EHR system integrations (HL7/FHIR)</li>
                <li>Real-time continuous data feeds</li>
                <li>Hospital-specific model calibration</li>
                <li>External variables (weather, local events, EMS dispatch)</li>
                <li>Advanced ML models (LSTM, Prophet, XGBoost)</li>
                <li>Rigorous prospective clinical validation</li>
              </ul>
            </div>
            <p className="text-xs text-orange-700 italic bg-orange-500/10 p-2 rounded">
              Note: These advanced capabilities are not yet implemented in this demonstration prototype.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
