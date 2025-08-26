export interface Plot {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
  category?: PlotCategory;
}

export interface PlotCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
}

export interface Row {
  id: string;
  plot_id?: string;
  name: string;
  variety?: string;
  planted_date?: string;
  expected_harvest?: string;
  notes?: string;
  position: number;
  status: 'planned' | 'planted' | 'growing' | 'harvested' | 'removed';
  created_at: string;
  updated_at: string;
  plot?: Plot;
  categories?: RowCategory[];
  custom_fields?: RowFieldValue[];
}

export interface RowCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
}

export interface RowCategoryAssignment {
  id: string;
  row_id: string;
  category_id: string;
  created_at: string;
  category?: RowCategory;
}

export interface RowFieldDefinition {
  id: string;
  name: string;
  field_type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox';
  options?: string[];
  is_required: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface RowFieldValue {
  id: string;
  row_id: string;
  field_id: string;
  value: any;
  created_at: string;
  updated_at: string;
  field_definition?: RowFieldDefinition;
}