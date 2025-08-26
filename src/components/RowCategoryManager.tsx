import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Check } from 'lucide-react';
import { rowCategoryService } from '../services/rowCategoryService';
import type { RowCategory } from '../types/database';

interface RowCategoryManagerProps {
  onCategorySelect?: (categoryId: string | null) => void;
  selectedCategoryId?: string | null;
  multiSelect?: boolean;
  selectedCategories?: string[];
  onCategoriesChange?: (categoryIds: string[]) => void;
}

export function RowCategoryManager({ 
  onCategorySelect, 
  selectedCategoryId,
  multiSelect = false,
  selectedCategories = [],
  onCategoriesChange
}: RowCategoryManagerProps) {
  const [categories, setCategories] = useState<RowCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RowCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await rowCategoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await rowCategoryService.updateCategory(editingCategory.id, formData);
      } else {
        await rowCategoryService.createCategory(formData);
      }
      
      await loadCategories();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category: RowCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? This will remove it from all rows.')) {
      try {
        await rowCategoryService.deleteCategory(id);
        await loadCategories();
        
        // If the deleted category was selected, clear the selection
        if (selectedCategoryId === id && onCategorySelect) {
          onCategorySelect(null);
        }
        
        // If in multi-select mode, remove from selected categories
        if (multiSelect && onCategoriesChange) {
          onCategoriesChange(selectedCategories.filter(catId => catId !== id));
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6'
    });
    setEditingCategory(null);
  };

  const handleCategoryClick = (category: RowCategory) => {
    if (multiSelect) {
      if (onCategoriesChange) {
        const isSelected = selectedCategories.includes(category.id);
        if (isSelected) {
          onCategoriesChange(selectedCategories.filter(id => id !== category.id));
        } else {
          onCategoriesChange([...selectedCategories, category.id]);
        }
      }
    } else if (onCategorySelect) {
      onCategorySelect(selectedCategoryId === category.id ? null : category.id);
    }
  };

  const isSelected = (categoryId: string) => {
    return multiSelect 
      ? selectedCategories.includes(categoryId)
      : selectedCategoryId === categoryId;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Row Categories</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <div className="text-gray-500">Loading categories...</div>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <Tag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No categories defined yet.</p>
              <p className="text-gray-500 text-sm">Add categories to organize your rows.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    isSelected(category.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  } transition-colors cursor-pointer`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-gray-900">{category.name}</span>
                  
                  {isSelected(category.id) && multiSelect && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                  
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(category);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(category.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
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
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    title="Hex color code (e.g. #FF0000)"
                  />
                </div>
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}