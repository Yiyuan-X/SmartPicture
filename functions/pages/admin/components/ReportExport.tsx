import React from 'react';

export function ReportExport() {
  const handleExport = (format: 'csv' | 'excel') => {
    const url = `${process.env.NEXT_PUBLIC_FUNCTION_URL}/exportReports?format=${format}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <h2 className="text-xl font-semibold mb-2">📊 报表导出</h2>
      <div className="space-x-2">
        <button onClick={() => handleExport('csv')} className="bg-blue-600 text-white px-4 py-2 rounded">
          导出 CSV
        </button>
        <button onClick={() => handleExport('excel')} className="bg-green-600 text-white px-4 py-2 rounded">
          导出 Excel
        </button>
      </div>
    </div>
  );
}
