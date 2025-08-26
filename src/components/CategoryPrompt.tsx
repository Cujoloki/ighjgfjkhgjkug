import React, { useState } from 'react';
import { X, Check, Tag } from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface CategoryPromptProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  categories: CategoryOption[];
  onSelect: (categoryId: string) => void;
  onCreateNew?: () => void;
  multiSelect?: boolean;
  selectedCategories?: string[];
}

export function CategoryPrompt({
  isOpen,
  onClose,
  title,
  message,
  categories,
  onSelect,
  onCreateNew,
  multiSelect = false,
  selectedCategories = []
}: CategoryPromptProps) {
  const [selected, setSelected] = useState<string[]>(selectedCategories);

  if (!isOpen) return null;

  const handleSelect = (categoryId: string) => {
    if (multiSelect) {
      // Toggle selection for multi-select
      const newSelected = selected.includes(categoryId)
        ? selected.filter(id => id !== categoryId)
        : [...selected, categoryId];
      
      setSelected(newSelected);
    } else {
      // Single select
      onSelect(categoryId);
      onClose();
    }
  };

  const handleConfirm = () => {
    if (multiSelect && selected.length > 0) {
      // For multi-select, we need to confirm the selection
      onSelect(selected.join(','));
    }
    onClose();
  };

  return (
    <>
      <div className="farm-prompt-backdrop" onClick={onClose}></div>
      <div className="farm-prompt-dialog">
        <div className="farm-prompt-header">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            <span>{title}</span>
          </div>
        </div>
        
        <div className="farm-prompt-content">
          <p className="text-gray-600 mb-4">{message}</p>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map(category => (
              <div
                key={category.id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                  multiSelect && selected.includes(category.id) || (!multiSelect && selectedCategories.includes(category.id))
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleSelect(category.id)}
              >
                <div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: category.color }}
                ></div>
                <div className="flex-1">
                  <div className="font-medium">{category.name}</div>
                  {category.description && (
                    <div className="text-xs text-gray-500">{category.description}</div>
                  )}
                </div>
                {(multiSelect && selected.includes(category.id)) && (
                  <Check className="w-5 h-5 text-blue-500" />
                )}
              </div>
            ))}
            
            {onCreateNew && (
              <button
                onClick={onCreateNew}
                className="w-full p-3 border border-dashed border-gray-300 rounded-lg text-center text-gray-500 hover:border-blue-300 hover:text-blue-500"
              >
                + Create new category
              </button>
            )}
          </div>
        </div>
        
        <div className="farm-prompt-actions">
          <button
            onClick={onClose}
            className="farm-button-secondary"
          >
            Cancel
          </button>
          
          {multiSelect && (
            <button
              onClick={handleConfirm}
              className="farm-button-primary"
              disabled={selected.length === 0}
            >
              Confirm ({selected.length})
            </button>
          )}
        </div>
      </div>
    </>
  );
}