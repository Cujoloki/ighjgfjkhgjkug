import React, { useState, useEffect } from 'react';
import { PlotSelector } from './PlotSelector';
import { RowCategoryManager } from './RowCategoryManager';
import { CustomFieldsRenderer } from './CustomFieldRenderer';
import { rowFieldService } from '../services/rowFieldService';
import type { Row, RowFieldDefinition, RowFieldValue } from '../types/database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';

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
    notes: row?.notes || '',
    status: row?.status || 'planned'
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [fieldDefinitions, setFieldDefinitions] = useState<RowFieldDefinition[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFormData();
  }, [row]);

  const loadFormData = async () => {
    setIsLoading(true);
    try {
      // Load field definitions
      const definitions = await rowFieldService.getFieldDefinitions();
      setFieldDefinitions(definitions);
      
      // Set initial categories if editing a row
      if (row?.categories) {
        setSelectedCategories(row.categories.map(c => c.id));
      }
      
      // Set initial custom field values if editing a row
      if (row?.custom_fields) {
        const values: Record<string, any> = {};
        row.custom_fields.forEach(field => {
          values[field.field_id] = field.value;
        });
        setCustomFieldValues(values);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare custom fields data
    const custom_fields = Object.entries(customFieldValues).map(([fieldId, value]) => ({
      field_id: fieldId,
      value
    }));
    
    // Prepare categories
    const categories = selectedCategories;
    
    onSave({
      ...formData,
      custom_fields,
      categories
    });
  };
  
  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  const getCustomFieldsForForm = () => {
    return fieldDefinitions.map(def => {
      return {
        id: `temp-${def.id}`,
        row_id: row?.id || 'new',
        field_id: def.id,
        value: customFieldValues[def.id] || null,
        field_definition: def
      } as RowFieldValue;
    });
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="custom">Custom Fields</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Row['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="planned">Planned</option>
              <option value="planted">Planted</option>
              <option value="growing">Growing</option>
              <option value="harvested">Harvested</option>
              <option value="removed">Removed</option>
            </select>
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
        </TabsContent>
        
        <TabsContent value="categories">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Assign categories to this row to help organize and filter your rows.
            </p>
            
            <RowCategoryManager
              multiSelect={true}
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="custom">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Add custom field values to track additional information about this row.
            </p>
            
            {fieldDefinitions.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No custom fields defined yet.</p>
                <p className="text-gray-500 text-sm">
                  You can create custom fields in the settings to track additional information.
                </p>
              </div>
            ) : (
              <CustomFieldsRenderer
                fieldValues={getCustomFieldsForForm()}
                onValueChange={handleCustomFieldChange}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
      
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