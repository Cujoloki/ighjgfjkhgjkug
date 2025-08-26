import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Rows, Calendar, Filter, Tag, Settings, ArrowUpDown } from 'lucide-react';
import { rowService } from '../services/rowService';
import { rowCategoryService } from '../services/rowCategoryService';
import { rowFieldService } from '../services/rowFieldService';
import { RowForm } from '../components/RowForm';
import { RowCategoryManager } from '../components/RowCategoryManager';
import { CustomFieldManager } from '../components/CustomFieldManager';
import { CustomFieldsRenderer } from '../components/CustomFieldRenderer';
import { PlotSelector } from '../components/PlotSelector';
import type { Row, Plot, RowCategory, RowFieldDefinition } from '../types/database';

export function RowsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadRows();
  }, [selectedPlotId, selectedCategoryId]);

  const loadRows = async () => {
    try {
      setIsLoading(true);
      let data: Row[];
      
      if (selectedCategoryId) {
        data = await rowService.getRowsByCategory(selectedCategoryId);
      } else if (selectedPlotId) {
        data = await rowService.getRowsByPlot(selectedPlotId);
      } else {
        data = await rowService.getRows();
      }
      
      // Sort the rows
      const sortedRows = sortRows(data, sortField, sortDirection);
      setRows(sortedRows);
    } catch (error) {
      console.error('Error loading rows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortRows = (rowsToSort: Row[], field: string, direction: 'asc' | 'desc') => {
    return [...rowsToSort].sort((a, b) => {
      let valueA: any = a[field as keyof Row];
      let valueB: any = b[field as keyof Row];
      
      // Handle nested fields
      if (field === 'plot.name') {
        valueA = a.plot?.name;
        valueB = b.plot?.name;
      }
      
      // Handle null values
      if (valueA === null || valueA === undefined) return direction === 'asc' ? -1 : 1;
      if (valueB === null || valueB === undefined) return direction === 'asc' ? 1 : -1;
      
      // Compare based on type
      if (typeof valueA === 'string') {
        return direction === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      // Default numeric comparison
      return direction === 'asc' ? valueA - valueB : valueB - valueA;
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set default direction
      setSortField(field);
      setSortDirection('asc');
    }
    
    // Re-sort the rows
    setRows(sortRows(rows, field, sortDirection === 'asc' ? 'desc' : 'asc'));
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
  
  const getStatusBadgeColor = (status: Row['status']) => {
    const colors: Record<Row['status'], string> = {
      planned: 'bg-gray-100 text-gray-800',
      planted: 'bg-green-100 text-green-800',
      growing: 'bg-blue-100 text-blue-800',
      harvested: 'bg-purple-100 text-purple-800',
      removed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
  
  const getStatusLabel = (status: Row['status']) => {
    const labels: Record<Row['status'], string> = {
      planned: 'Planned',
      planted: 'Planted',
      growing: 'Growing',
      harvested: 'Harvested',
      removed: 'Removed'
    };
    return labels[status] || status;
  };

  const clearFilters = () => {
    setSelectedPlotId(null);
    setSelectedCategoryId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rows</h1>
          <p className="text-gray-600">
            {selectedPlotId && 'Filtered by plot • '}
            {selectedCategoryId && 'Filtered by category • '}
            {rows.length} {rows.length === 1 ? 'row' : 'rows'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            {(selectedPlotId || selectedCategoryId) && (
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            )}
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          
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
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Filter Rows</h3>
            {(selectedPlotId || selectedCategoryId) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Plot
              </label>
              <PlotSelector
                selectedPlotId={selectedPlotId || undefined}
                onPlotSelect={(plotId) => setSelectedPlotId(plotId || null)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <RowCategoryManager
                selectedCategoryId={selectedCategoryId || undefined}
                onCategorySelect={setSelectedCategoryId}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Row Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Custom Fields</h4>
              <p className="text-sm text-gray-600 mb-4">
                Define custom fields to track additional information about your rows.
              </p>
              <CustomFieldManager />
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Row Categories</h4>
              <p className="text-sm text-gray-600 mb-4">
                Create categories to organize and filter your rows.
              </p>
              <RowCategoryManager />
            </div>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <button
          onClick={() => handleSort('name')}
          className={`text-sm px-2 py-1 rounded ${
            sortField === 'name' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('status')}
          className={`text-sm px-2 py-1 rounded ${
            sortField === 'status' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('planted_date')}
          className={`text-sm px-2 py-1 rounded ${
            sortField === 'planted_date' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Planted Date {sortField === 'planted_date' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('plot.name')}
          className={`text-sm px-2 py-1 rounded ${
            sortField === 'plot.name' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Plot {sortField === 'plot.name' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(row.status)}`}>
                        {getStatusLabel(row.status)}
                      </span>
                    </div>
                    
                    {/* Row Categories */}
                    {row.categories && row.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {row.categories.map(category => (
                          <span
                            key={category.id}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded-full text-white"
                            style={{ backgroundColor: category.color }}
                          >
                            <Tag className="w-3 h-3" />
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}
                    
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
                    
                    {/* Custom Fields */}
                    {row.custom_fields && row.custom_fields.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-2">Custom Fields</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <CustomFieldsRenderer fieldValues={row.custom_fields} readOnly={true} />
                        </div>
                      </div>
                    )}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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