import React from 'react';
import type { RowFieldValue, RowFieldDefinition } from '../types/database';

interface CustomFieldRendererProps {
  fieldValue: RowFieldValue;
  onValueChange?: (value: any) => void;
  readOnly?: boolean;
}

export function CustomFieldRenderer({ fieldValue, onValueChange, readOnly = false }: CustomFieldRendererProps) {
  const field = fieldValue.field_definition;
  
  if (!field) {
    return <div className="text-red-500">Field definition not found</div>;
  }
  
  const handleChange = (value: any) => {
    if (onValueChange && !readOnly) {
      onValueChange(value);
    }
  };
  
  const renderFieldInput = () => {
    switch (field.field_type) {
      case 'text':
        return (
          <input
            type="text"
            value={fieldValue.value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            value={fieldValue.value || ''}
            onChange={(e) => handleChange(parseFloat(e.target.value) || null)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
        );
        
      case 'date':
        return (
          <input
            type="date"
            value={fieldValue.value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
        );
        
      case 'dropdown':
        return (
          <select
            value={fieldValue.value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Select an option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={!!fieldValue.value}
              onChange={(e) => handleChange(e.target.checked)}
              disabled={readOnly}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              {field.name}
            </label>
          </div>
        );
        
      default:
        return <div className="text-red-500">Unknown field type: {field.field_type}</div>;
    }
  };
  
  const renderReadOnlyValue = () => {
    if (readOnly) {
      switch (field.field_type) {
        case 'text':
        case 'number':
        case 'date':
        case 'dropdown':
          return (
            <div className="text-gray-900">
              {fieldValue.value || <span className="text-gray-400">Not set</span>}
            </div>
          );
          
        case 'checkbox':
          return (
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded border ${fieldValue.value ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                {fieldValue.value && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="ml-2 text-gray-900">{field.name}</span>
            </div>
          );
          
        default:
          return <div className="text-red-500">Unknown field type: {field.field_type}</div>;
      }
    }
    
    return null;
  };
  
  return (
    <div className="space-y-1">
      {field.field_type !== 'checkbox' && (
        <label className="block text-sm font-medium text-gray-700">
          {field.name}
          {field.is_required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {readOnly ? renderReadOnlyValue() : renderFieldInput()}
    </div>
  );
}

interface CustomFieldsRendererProps {
  fieldValues: RowFieldValue[];
  onValueChange?: (fieldId: string, value: any) => void;
  readOnly?: boolean;
}

export function CustomFieldsRenderer({ fieldValues, onValueChange, readOnly = false }: CustomFieldsRendererProps) {
  if (!fieldValues || fieldValues.length === 0) {
    return null;
  }
  
  const handleValueChange = (fieldId: string, value: any) => {
    if (onValueChange && !readOnly) {
      onValueChange(fieldId, value);
    }
  };
  
  return (
    <div className="space-y-4">
      {fieldValues.map((fieldValue) => (
        <CustomFieldRenderer
          key={fieldValue.id}
          fieldValue={fieldValue}
          onValueChange={(value) => handleValueChange(fieldValue.field_id, value)}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}