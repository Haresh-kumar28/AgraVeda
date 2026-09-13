import { BottleneckResult } from '../engines/bottleneckEngine';
import { BarChart3 } from 'lucide-react';

interface ResourceTableProps {
  bottlenecks: BottleneckResult;
}

const statusBadge = {
  ok: 'bg-emerald-500/20 text-emerald-700',
  warning: 'bg-orange-50 text-orange-700',
  critical: 'bg-red-500/20 text-red-700',
};

export default function ResourceTable({ bottlenecks }: ResourceTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-blue-600" />
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Resource Gap Analysis</h3>
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="text-slate-500 uppercase">
            <th className="text-left pb-2 font-medium">Resource</th>
            <th className="text-right pb-2 font-medium">Available</th>
            <th className="text-right pb-2 font-medium">Required</th>
            <th className="text-right pb-2 font-medium">Gap</th>
            <th className="text-right pb-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {bottlenecks.all.map((b) => (
            <tr key={b.resource} className={`border-t border-slate-200 ${b.isPrimary ? 'bg-slate-50' : ''}`}>
              <td className="py-2 text-left">
                <span className="text-slate-800 font-medium">{b.label}</span>
                {b.isPrimary && <span className="ml-1.5 text-[9px] text-orange-700 font-bold">PRIMARY</span>}
              </td>
              <td className="py-2 text-right text-slate-700">{b.available}</td>
              <td className="py-2 text-right text-slate-700">{b.required}</td>
              <td className={`py-2 text-right font-bold ${b.gap < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                {b.gap > 0 ? '+' : ''}{b.gap}
              </td>
              <td className="py-2 text-right">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusBadge[b.status]}`}>
                  {b.status.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
