import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Filter, Rows, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PlotCategoryManager } from '../components/PlotCategoryManager';
import { plotService } from '../services/plotService';
import { rowService } from '../services/rowService';
import type { Plot, PlotCategory, Row } from '../types/database';

export function PlotsPage() {
  const navigate = useNavigate();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [plotRows, setPlotRows] = useState<Record<string, Row[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<PlotCategory | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: ''
  });
  const [expandedPlots, setExpandedPlots] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadPlots();
  }, [selectedCategory]);

  const loadPlots = async () => {
    try {
      const data = selectedCategory 
        ? await plotService.getPlotsByCategory(selectedCategory.id)
        : await plotService.getPlots();
      setPlots(data);
      
      // Load rows for each plot
      const rowsData: Record<string, Row[]> = {};
      for (const plot of data) {
        if (expandedPlots[plot.id]) {
          const plotRows = await rowService.getRowsByPlot(plot.id);
          rowsData[plot.id] = plotRows;
        }
      }
      setPlotRows(rowsData);
    } catch (error) {
      console.error('Error loading plots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const plotData = {
        ...formData,
        category_id: formData.category_id || null
      };
      
      if (editingPlot) {
        await plotService.updatePlot(editingPlot.id, plotData);
      } else {
        await plotService.createPlot(plotData);
      }
      
      await loadPlots();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving plot:', error);
    }
  };

  const handleEdit = (plot: Plot) => {
    setEditingPlot(plot);
    setFormData({
      name: plot.name,
      description: plot.description || '',
      category_id: plot.category_id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this plot? This will also delete all rows in this plot.')) {
      try {
        await plotService.deletePlot(id);
        await loadPlots();
      } catch (error) {
        console.error('Error deleting plot:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      description: '',
      category_id: ''
    });
    setEditingPlot(null);
  };
  
  const togglePlotExpansion = async (plotId: string) => {
    const newExpandedState = !expandedPlots[plotId];
    setExpandedPlots({
      ...expandedPlots,
      [plotId]: newExpandedState
    });
    
    // Load rows if expanding
    if (newExpandedState && !plotRows[plotId]) {
      try {
        const rows = await rowService.getRowsByPlot(plotId);
        setPlotRows({
          ...plotRows,
          [plotId]: rows
        });
      } catch (error) {
        console.error('Error loading rows for plot:', error);
      }
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plots</h1>
          {selectedCategory && (
            <p className="text-sm text-gray-600 mt-1">
              Showing plots in category: <span className="font-medium">{selectedCategory.name}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Categories
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Plot
          </button>
        </div>
      </div>

      {/* Category Manager */}
      {showCategoryManager && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <PlotCategoryManager 
            onCategorySelect={setSelectedCategory}
            selectedCategoryId={selectedCategory?.id}
          />
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading plots...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {plots.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No plots found. Create your first plot to get started.</p>
            </div>
          ) : (
            plots.map((plot) => (
              <div key={plot.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{plot.name}</h3>
                        {plot.category && (
                          <span
                            className="px-2 py-1 text-xs rounded-full text-white"
                            style={{ backgroundColor: plot.category.color }}
                          >
                            {plot.category.name}
                          </span>
                        )}
                      </div>
                      {plot.description && (
                        <p className="text-gray-600">{plot.description}</p>
                      )}
                      
                      <button
                        onClick={() => togglePlotExpansion(plot.id)}
                        className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Rows className="w-4 h-4" />
                        {expandedPlots[plot.id] ? 'Hide Rows' : 'Show Rows'}
                      </button>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(plot)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(plot.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Rows for this plot */}
                {expandedPlots[plot.id] && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Rows in this Plot</h4>
                        <button
                          onClick={() => navigate('/rows')}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Manage Rows <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {plotRows[plot.id]?.length === 0 ? (
                        <div className="text-center py-4 bg-white rounded-lg">
                          <p className="text-gray-500">No rows in this plot yet.</p>
                          <button
                            onClick={() => navigate('/rows')}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            Add rows to this plot
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {plotRows[plot.id]?.map(row => (
                            <div key={row.id} className="bg-white p-3 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{row.name}</span>
                                    {row.variety && (
                                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                                        {row.variety}
                                      </span>
                                    )}
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeColor(row.status)}`}>
                                      {row.status}
                                    </span>
                                  </div>
                                  {row.planted_date && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Planted: {new Date(row.planted_date).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    navigate('/rows');
                                    // Ideally we would navigate directly to this row
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {/* Row Categories */}
                              {row.categories && row.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {row.categories.map(category => (
                                    <span
                                      key={category.id}
                                      className="px-1.5 py-0.5 text-xs rounded-full text-white"
                                      style={{ backgroundColor: category.color }}
                                    >
                                      {category.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
              {editingPlot ? 'Edit Plot' : 'Add New Plot'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plot Name
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">No category</option>
                  {/* We need to load categories here */}
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingPlot ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}