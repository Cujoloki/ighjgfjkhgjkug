import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Rows, 
  Calendar, 
  TrendingUp, 
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { VoiceCommandPanel } from '../components/VoiceCommandPanel';
import { plotService } from '../services/plotService';
import { rowService } from '../services/rowService';
import type { Plot, Row } from '../types/database';

export function DashboardPage() {
  const navigate = useNavigate();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [plotsData, rowsData] = await Promise.all([
        plotService.getPlots(),
        rowService.getRows()
      ]);
      setPlots(plotsData);
      setRows(rowsData);
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
      icon: MapPin,
      color: 'bg-blue-500',
      action: () => navigate('/plots')
    },
    {
      title: 'Total Rows',
      value: rows.length,
      icon: Rows,
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
      icon: Calendar,
      color: 'bg-purple-500'
    },
    {
      title: 'Categories',
      value: new Set(plots.map(plot => plot.category?.name).filter(Boolean)).size,
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

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
                <stat.icon className="w-6 h-6 text-white" />
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
              <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
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
                      {plot.category && (
                        <div className="text-xs text-gray-500">{plot.category.name}</div>
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
              <Rows className="w-8 h-8 text-gray-400 mx-auto mb-2" />
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
    </div>
  );
}