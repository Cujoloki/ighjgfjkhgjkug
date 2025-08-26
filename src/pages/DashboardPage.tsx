import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { VoiceCommandPanel } from '../components/VoiceCommandPanel';
import { FloatingMicButton } from '../components/FloatingMicButton';
import { FarmIcon, FarmIconBg } from '../components/FarmIcons';
import { CategoryPrompt } from '../components/CategoryPrompt';
import { plotService } from '../services/plotService';
import { rowService } from '../services/rowService';
import { applySeasonalTheme, getSeasonalGreeting } from '../utils/seasonTheme';
import type { Plot, Row, PlotCategory, RowCategory } from '../types/database';
import '../styles/farm-theme.css';

export function DashboardPage() {
  const navigate = useNavigate();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  // State for category prompts
  const [showPlotCategoryPrompt, setShowPlotCategoryPrompt] = useState(false);
  const [showRowCategoryPrompt, setShowRowCategoryPrompt] = useState(false);
  const [plotCategories, setPlotCategories] = useState<PlotCategory[]>([]);
  const [rowCategories, setRowCategories] = useState<RowCategory[]>([]);
  const [itemToCategorizePlot, setItemToCategorizePlot] = useState<Plot | null>(null);
  const [itemToCategorizeRow, setItemToCategorizeRow] = useState<Row | null>(null);

  useEffect(() => {
    loadDashboardData();
    applySeasonalTheme(); // Apply seasonal theme on load
    
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [plotsData, rowsData, plotCategoriesData, rowCategoriesData] = await Promise.all([
        plotService.getPlots(),
        rowService.getRows(),
        plotService.getCategories(),
        rowService ? rowService.getCategories?.() : Promise.resolve([]) // Handle if not implemented yet
      ]);
      setPlots(plotsData);
      setRows(rowsData);
      setPlotCategories(plotCategoriesData);
      if (rowCategoriesData) setRowCategories(rowCategoriesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addActivity = (activity: string) => {
    setRecentActivity(prev => [
      `${new Date().toLocaleTimeString()}: ${activity}`,
      ...prev.slice(0, 4) // Keep only last 5 activities
    ]);
  };

  // Voice commands configuration
  const voiceCommands = [
    {
      command: 'show plots',
      action: () => navigate('/plots'),
      description: 'Navigate to plots page'
    },
    {
      command: 'show rows',
      action: () => navigate('/rows'),
      description: 'Navigate to rows page'
    },
    {
      command: 'add new plot',
      action: () => navigate('/plots'),
      description: 'Go to plots page to add new plot'
    },
    {
      command: 'add new row',
      action: () => navigate('/rows'),
      description: 'Go to rows page to add new row'
    },
    {
      command: 'refresh dashboard',
      action: () => {
        loadDashboardData();
        addActivity('Dashboard refreshed via voice command');
      },
      description: 'Refresh dashboard data'
    },
    {
      command: 'go home',
      action: () => navigate('/'),
      description: 'Navigate to dashboard'
    },
    {
      command: 'show statistics',
      action: () => {
        const stats = `${plots.length} plots, ${rows.length} rows total`;
        addActivity(`Statistics viewed: ${stats}`);
      },
      description: 'Show current statistics'
    }
  ];

  const stats = [
    {
      title: 'Total Plots',
      value: plots.length,
      icon: 'plots',
      color: 'bg-blue-500',
      action: () => navigate('/plots')
    },
    {
      title: 'Total Rows',
      value: rows.length,
      icon: 'rows',
      color: 'bg-green-500',
      action: () => navigate('/rows')
    },
    {
      title: 'This Month',
      value: rows.filter(row => {
        const plantedDate = row.planted_date ? new Date(row.planted_date) : null;
        const thisMonth = new Date();
        return plantedDate && 
               plantedDate.getMonth() === thisMonth.getMonth() && 
               plantedDate.getFullYear() === thisMonth.getFullYear();
      }).length,
      icon: 'calendar',
      color: 'bg-purple-500'
    },
    {
      title: 'Categories',
      value: new Set(plots.map(plot => plot.category?.name).filter(Boolean)).size,
      icon: 'categories',
      color: 'bg-orange-500'
    }
  ];
  
  // Handle plot categorization
  const handleCategorizePlot = (plot: Plot) => {
    setItemToCategorizePlot(plot);
    setShowPlotCategoryPrompt(true);
  };
  
  // Handle row categorization
  const handleCategorizeRow = (row: Row) => {
    setItemToCategorizeRow(row);
    setShowRowCategoryPrompt(true);
  };
  
  // Handle plot category selection
  const handlePlotCategorySelect = async (categoryId: string) => {
    if (itemToCategorizePlot) {
      try {
        await plotService.updatePlot(itemToCategorizePlot.id, { category_id: categoryId });
        addActivity(`Plot "${itemToCategorizePlot.name}" categorized`);
        await loadDashboardData();
      } catch (error) {
        console.error('Error categorizing plot:', error);
      }
    }
  };
  
  // Handle row category selection
  const handleRowCategorySelect = async (categoryIds: string) => {
    if (itemToCategorizeRow && rowService.updateRow) {
      try {
        // Split comma-separated IDs for multi-select
        const categories = categoryIds.split(',');
        await rowService.updateRow(itemToCategorizeRow.id, { categories });
        addActivity(`Row "${itemToCategorizeRow.name}" categorized`);
        await loadDashboardData();
      } catch (error) {
        console.error('Error categorizing row:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  // Render mobile-friendly dashboard with farm theme
  if (isMobile) {
    return (
      <div className="farm-themed-dashboard">
        {/* Themed Header */}
        <div className="farm-themed-header">
          <h1 className="text-2xl font-bold">{getSeasonalGreeting()}</h1>
          <p className="text-white opacity-90">Welcome to your farm dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 px-3 mb-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="farm-themed-stat p-4"
              onClick={stat.action}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <FarmIconBg type={stat.icon as any} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="farm-themed-section mx-3 mb-4">
            <div className="farm-themed-section-header">
              <h3>Recent Activity</h3>
            </div>
            <div className="p-3 space-y-2">
              {recentActivity.map((activity, index) => (
                <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  {activity}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="px-3 space-y-4">
          {/* Recent Plots */}
          <div className="farm-themed-section">
            <div className="farm-themed-section-header justify-between">
              <h3>Recent Plots</h3>
              <button
                onClick={() => navigate('/plots')}
                className="text-sm text-blue-600"
              >
                View All
              </button>
            </div>
            
            <div className="p-3">
              {plots.length === 0 ? (
                <div className="text-center py-4">
                  <FarmIconBg type="plots" className="mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No plots created yet</p>
                  <button
                    onClick={() => navigate('/plots')}
                    className="mt-2 flex items-center gap-1 text-sm text-blue-600 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Create your first plot
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {plots.slice(0, 3).map((plot) => (
                    <div key={plot.id} className="farm-list-item p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {plot.category ? (
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: plot.category.color }}
                            />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-gray-300" />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{plot.name}</div>
                            {plot.category ? (
                              <div className="text-xs text-gray-500">{plot.category.name}</div>
                            ) : (
                              <button 
                                className="text-xs text-blue-500"
                                onClick={() => handleCategorizePlot(plot)}
                              >
                                + Add category
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => navigate('/plots')}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Rows */}
          <div className="farm-themed-section">
            <div className="farm-themed-section-header justify-between">
              <h3>Recent Rows</h3>
              <button
                onClick={() => navigate('/rows')}
                className="text-sm text-blue-600"
              >
                View All
              </button>
            </div>
            
            <div className="p-3">
              {rows.length === 0 ? (
                <div className="text-center py-4">
                  <FarmIconBg type="rows" className="mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No rows created yet</p>
                  <button
                    onClick={() => navigate('/rows')}
                    className="mt-2 flex items-center gap-1 text-sm text-blue-600 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Create your first row
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {rows.slice(0, 3).map((row) => (
                    <div key={row.id} className="farm-list-item p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{row.name}</div>
                          <div className="text-xs text-gray-500">
                            {row.variety && `${row.variety} • `}
                            {row.plot?.name || 'No plot assigned'}
                          </div>
                          
                          {/* Show categories or prompt to add */}
                          {row.categories && row.categories.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {row.categories.slice(0, 2).map(category => (
                                <span
                                  key={category.id}
                                  className="px-1 py-0.5 text-xs rounded-full text-white"
                                  style={{ backgroundColor: category.color }}
                                >
                                  {category.name}
                                </span>
                              ))}
                              {row.categories.length > 2 && (
                                <span className="px-1 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
                                  +{row.categories.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <button 
                              className="text-xs text-blue-500 mt-1"
                              onClick={() => handleCategorizeRow(row)}
                            >
                              + Add categories
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => navigate('/rows')}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Mic Button */}
        <FloatingMicButton 
          commands={voiceCommands}
          onCommandExecuted={(command) => addActivity(`Voice command executed: "${command}"`)}
        />
        
        {/* Plot Category Prompt */}
        <CategoryPrompt
          isOpen={showPlotCategoryPrompt}
          onClose={() => setShowPlotCategoryPrompt(false)}
          title="Select Plot Category"
          message={`Choose a category for plot "${itemToCategorizePlot?.name || ''}"`}
          categories={plotCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            color: cat.color,
            description: cat.description
          }))}
          onSelect={handlePlotCategorySelect}
          selectedCategories={itemToCategorizePlot?.category_id ? [itemToCategorizePlot.category_id] : []}
        />
        
        {/* Row Category Prompt */}
        <CategoryPrompt
          isOpen={showRowCategoryPrompt}
          onClose={() => setShowRowCategoryPrompt(false)}
          title="Select Row Categories"
          message={`Choose categories for row "${itemToCategorizeRow?.name || ''}"`}
          categories={rowCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            color: cat.color,
            description: cat.description
          }))}
          onSelect={handleRowCategorySelect}
          multiSelect={true}
          selectedCategories={itemToCategorizeRow?.categories?.map(c => c.id) || []}
        />
      </div>
    );
  }

  // Desktop version (original)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farm Dashboard</h1>
          <p className="text-gray-600">Overview of your farm management system</p>
        </div>
      </div>

      {/* Voice Commands Panel */}
      <VoiceCommandPanel 
        commands={voiceCommands}
        onCommandExecuted={(command) => addActivity(`Voice command executed: "${command}"`)}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${
              stat.action ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
            }`}
            onClick={stat.action}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <FarmIcon type={stat.icon as any} className="w-6 h-6 text-white" seasonal={false} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {recentActivity.map((activity, index) => (
              <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                {activity}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Plots */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Plots</h3>
            <button
              onClick={() => navigate('/plots')}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Eye className="w-4 h-4" />
              View All
            </button>
          </div>
          
          {plots.length === 0 ? (
            <div className="text-center py-4">
              <FarmIcon type="plots" className="w-8 h-8 text-gray-400 mx-auto mb-2" seasonal={false} />
              <p className="text-gray-500 text-sm">No plots created yet</p>
              <button
                onClick={() => navigate('/plots')}
                className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create your first plot
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {plots.slice(0, 3).map((plot) => (
                <div key={plot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {plot.category && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: plot.category.color }}
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{plot.name}</div>
                      {plot.category ? (
                        <div className="text-xs text-gray-500">{plot.category.name}</div>
                      ) : (
                        <button 
                          className="text-xs text-blue-500"
                          onClick={() => handleCategorizePlot(plot)}
                        >
                          + Add category
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => navigate('/plots')}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Rows */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Rows</h3>
            <button
              onClick={() => navigate('/rows')}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Eye className="w-4 h-4" />
              View All
            </button>
          </div>
          
          {rows.length === 0 ? (
            <div className="text-center py-4">
              <FarmIcon type="rows" className="w-8 h-8 text-gray-400 mx-auto mb-2" seasonal={false} />
              <p className="text-gray-500 text-sm">No rows created yet</p>
              <button
                onClick={() => navigate('/rows')}
                className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create your first row
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.slice(0, 3).map((row) => (
                <div key={row.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{row.name}</div>
                    <div className="text-sm text-gray-500">
                      {row.variety && `${row.variety} • `}
                      {row.plot?.name || 'No plot assigned'}
                    </div>
                    
                    {/* Show categories or prompt to add */}
                    {row.categories && row.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {row.categories.map(category => (
                          <span
                            key={category.id}
                            className="px-1 py-0.5 text-xs rounded-full text-white"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <button 
                        className="text-xs text-blue-500 mt-1"
                        onClick={() => handleCategorizeRow(row)}
                      >
                        + Add categories
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => navigate('/rows')}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Plot Category Prompt */}
      <CategoryPrompt
        isOpen={showPlotCategoryPrompt}
        onClose={() => setShowPlotCategoryPrompt(false)}
        title="Select Plot Category"
        message={`Choose a category for plot "${itemToCategorizePlot?.name || ''}"`}
        categories={plotCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
          description: cat.description
        }))}
        onSelect={handlePlotCategorySelect}
        selectedCategories={itemToCategorizePlot?.category_id ? [itemToCategorizePlot.category_id] : []}
      />
      
      {/* Row Category Prompt */}
      <CategoryPrompt
        isOpen={showRowCategoryPrompt}
        onClose={() => setShowRowCategoryPrompt(false)}
        title="Select Row Categories"
        message={`Choose categories for row "${itemToCategorizeRow?.name || ''}"`}
        categories={rowCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
          description: cat.description
        }))}
        onSelect={handleRowCategorySelect}
        multiSelect={true}
        selectedCategories={itemToCategorizeRow?.categories?.map(c => c.id) || []}
      />
    </div>
  );
}