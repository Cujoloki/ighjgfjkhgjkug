import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Rows, Calendar } from 'lucide-react';
import { rowService } from '../services/rowService';
import { RowForm } from '../components/RowForm';
import type { Row, Plot } from '../types/database';

export function RowsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);

  useEffect(() => {
    loadRows();
  }, [selectedPlotId]);

  const loadRows = async () => {
    try {
      const data = selectedPlotId 
        ? await rowService.getRowsByPlot(selectedPlotId)
        : await rowService.getRows();
      setRows(data);
    } catch (error) {
      console.error('Error loading rows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (rowData: Partial<Row>) => {
    try {
      if (editingRow) {
        await rowService.updateRow(editingRow.id, rowData);
      } else {
        await rowService.createRow(rowData as Omit<Row, 'id' | 'created_at' | 'updated_at'>);
      }
      
      await loadRows();
      setShowForm(false);
      setEditingRow(null);
    } catch (error) {
      console.error('Error saving row:', error);
    }
  };

  const handleEdit = (row: Row) => {
    setEditingRow(row);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this row?')) {
      try {
        await rowService.deleteRow(id);
        await loadRows();
      } catch (error) {
        console.error('Error deleting row:', error);
      }
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rows</h1>
          <p className="text-gray-600">Manage your planting rows</p>
        </div>
        <button
          onClick={() => {
            setEditingRow(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading rows...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.length === 0 ? (
            <div className="text-center py-8">
              <Rows className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No rows found. Create your first row to get started.</p>
            </div>
          ) : (
            rows.map((row) => (
              <div key={row.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{row.name}</h3>
                      {row.variety && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {row.variety}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-gray-500">Plot</p>
                        <p className="text-gray-900">{row.plot?.name || 'No plot assigned'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Planted Date</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{formatDate(row.planted_date)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Expected Harvest</p>
                        <p className="text-gray-900">{formatDate(row.expected_harvest)}</p>
                      </div>
                      
                      {row.notes && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Notes</p>
                          <p className="text-gray-900">{row.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(row)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingRow ? 'Edit Row' : 'Add New Row'}
            </h2>
            
            <RowForm 
              row={editingRow}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingRow(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}