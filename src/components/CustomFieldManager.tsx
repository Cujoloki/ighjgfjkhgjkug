import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MoveUp, MoveDown, Settings } from 'lucide-react';
import { rowFieldService } from '../services/rowFieldService';
import type { RowFieldDefinition } from '../types/database';

interface CustomFieldManagerProps {
  onFieldSelect?: (fieldId: string) => void;
  selectedFieldId?: string;
}

export function CustomFieldManager({ onFieldSelect, selectedFieldId }: CustomFieldManagerProps) {
  const [fields, setFields] = useState<RowFieldDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<RowFieldDefinition | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    field_type: 'text' as RowFieldDefinition['field_type'],
    is_required: false,
    options: [] as string[]
  });
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      const data = await rowFieldService.getFieldDefinitions();
      setFields(data);
    } catch (error) {
      console.error('Error loading field definitions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingField) {
        await rowFieldService.updateFieldDefinition(editingField.id, {
          ...formData,
          options: formData.field_type === 'dropdown' ? formData.options : []
        });
      } else {
        await rowFieldService.createFieldDefinition({
          ...formData,
          options: formData.field_type === 'dropdown' ? formData.options : [],
          display_order: fields.length
        });
      }
      
      await loadFields();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving field definition:', error);
    }
  };

  const handleEdit = (field: RowFieldDefinition) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      field_type: field.field_type,
      is_required: field.is_required,
      options: field.options || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this custom field? This will remove it from all rows.')) {
      try {
        await rowFieldService.deleteFieldDefinition(id);
        await loadFields();
      } catch (error) {
        console.error('Error deleting field definition:', error);
      }
    }
  };

  const handleMoveField = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(f => f.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === fields.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const fieldToMove = fields[currentIndex];
    const fieldToSwap = fields[newIndex];

    try {
      await Promise.all([
        rowFieldService.updateFieldDefinition(fieldToMove.id, { display_order: newIndex }),
        rowFieldService.updateFieldDefinition(fieldToSwap.id, { display_order: currentIndex })
      ]);
      await loadFields();
    } catch (error) {
      console.error('Error reordering fields:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      field_type: 'text',
      is_required: false,
      options: []
    });
    setNewOption('');
    setEditingField(null);
  };

  const addOption = () => {
    if (newOption.trim() && !formData.options.includes(newOption.trim())) {
      setFormData({
        ...formData,
        options: [...formData.options, newOption.trim()]
      });
      setNewOption('');
    }
  };

  const removeOption = (option: string) => {
    setFormData({
      ...formData,
      options: formData.options.filter(o => o !== option)
    });
  };

  const getFieldTypeLabel = (type: RowFieldDefinition['field_type']) => {
    const labels: Record<RowFieldDefinition['field_type'], string> = {
      text: 'Text',
      number: 'Number',
      date: 'Date',
      dropdown: 'Dropdown',
      checkbox: 'Checkbox'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Custom Fields</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Field
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <div className="text-gray-500">Loading custom fields...</div>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No custom fields defined yet.</p>
              <p className="text-gray-500 text-sm">Add custom fields to collect additional information about your rows.</p>
            </div>
          ) : (
            fields.map((field) => (
              <div
                key={field.id}
                className={`flex items-center justify-between p-3 bg-white border rounded-lg ${
                  selectedFieldId === field.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                } hover:border-blue-300 transition-colors cursor-pointer`}
                onClick={() => onFieldSelect && onFieldSelect(field.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{field.name}</span>
                    {field.is_required && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                        Required
                      </span>
                    )}
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                      {getFieldTypeLabel(field.field_type)}
                    </span>
                  </div>
                  {field.field_type === 'dropdown' && field.options && field.options.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {field.options.map((option, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 rounded-full text-gray-700">
                          {option}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveField(field.id, 'up');
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Move up"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveField(field.id, 'down');
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Move down"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(field);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit field"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(field.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Field Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingField ? 'Edit Custom Field' : 'Add Custom Field'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type
                </label>
                <select
                  value={formData.field_type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    field_type: e.target.value as RowFieldDefinition['field_type'],
                    // Clear options if changing from dropdown to another type
                    options: e.target.value === 'dropdown' ? formData.options : []
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={formData.is_required}
                  onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_required" className="ml-2 block text-sm text-gray-900">
                  Required Field
                </label>
              </div>
              
              {formData.field_type === 'dropdown' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dropdown Options
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="Add option"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addOption}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  {formData.options.length > 0 ? (
                    <div className="space-y-1 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span>{option}</span>
                          <button
                            type="button"
                            onClick={() => removeOption(option)}
                            className="text-red-500 hover:text-red-700"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No options added yet.</p>
                  )}
                </div>
              )}
              
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingField ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}