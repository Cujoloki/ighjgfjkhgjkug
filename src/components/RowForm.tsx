import React, { useState } from 'react';
import { PlotSelector } from './PlotSelector';
import type { Row } from '../types/database';

interface RowFormProps {
  row?: Row | null;
  onSave: (rowData: Partial<Row>) => void;
  onCancel: () => void;
}

export function RowForm({ row, onSave, onCancel }: RowFormProps) {
  const [formData, setFormData] = useState({
    plot_id: row?.plot_id || '',
    name: row?.name || '',
    variety: row?.variety || '',
    planted_date: row?.planted_date ? new Date(row.planted_date).toISOString().split('T')[0] : '',
    expected_harvest: row?.expected_harvest ? new Date(row.expected_harvest).toISOString().split('T')[0] : '',
    notes: row?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Row Name
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plot
        </label>
        <PlotSelector
          selectedPlotId={formData.plot_id}
          onPlotSelect={(plotId) => setFormData({ ...formData, plot_id: plotId || '' })}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Variety
        </label>
        <input
          type="text"
          value={formData.variety}
          onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Planted Date
          </label>
          <input
            type="date"
            value={formData.planted_date}
            onChange={(e) => setFormData({ ...formData, planted_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Harvest
          </label>
          <input
            type="date"
            value={formData.expected_harvest}
            onChange={(e) => setFormData({ ...formData, expected_harvest: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows={3}
        />
      </div>
      
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {row ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}