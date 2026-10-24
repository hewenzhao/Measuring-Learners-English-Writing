import React from 'react';

export function StatCard({ 
  label, 
  value, 
  icon, 
  suffix = '',
  subtext 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ReactNode; 
  suffix?: string;
  subtext?: string;
}) {
  return (
    <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="p-1.5 bg-blue-50 rounded-lg shrink-0">
          {icon}
        </div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate" title={label}>{label}</h3>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-bold text-gray-900 leading-none">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {suffix && <span className="text-xs sm:text-sm font-medium text-gray-500">{suffix}</span>}
        </div>
        {subtext && <p className="text-[11px] text-gray-400 mt-1 truncate" title={subtext}>{subtext}</p>}
      </div>
    </div>
  );
}
