import { supabase } from '../lib/supabase';
import type { Row } from '../types/database';
import { rowFieldService } from './rowFieldService';
import { rowCategoryService } from './rowCategoryService';

export const rowService = {
  async getRows(): Promise<Row[]> {
    const { data, error } = await supabase
      .from('rows')
      .select(`
        *,
        plot:plots(
          *,
          category:plot_categories(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Fetch custom fields and categories for each row
    const rowsWithExtras = await Promise.all((data || []).map(async (row) => {
      const [customFields, categories] = await Promise.all([
        rowFieldService.getFieldValues(row.id),
        rowCategoryService.getRowCategories(row.id)
      ]);
      
      return {
        ...row,
        custom_fields: customFields,
        categories
      };
    }));
    
    return rowsWithExtras;
  },

  async getRowsByPlot(plotId: string): Promise<Row[]> {
    const { data, error } = await supabase
      .from('rows')
      .select(`
        *,
        plot:plots(
          *,
          category:plot_categories(*)
        )
      `)
      .eq('plot_id', plotId)
      .order('position', { ascending: true });

    if (error) throw error;
    
    // Fetch custom fields and categories for each row
    const rowsWithExtras = await Promise.all((data || []).map(async (row) => {
      const [customFields, categories] = await Promise.all([
        rowFieldService.getFieldValues(row.id),
        rowCategoryService.getRowCategories(row.id)
      ]);
      
      return {
        ...row,
        custom_fields: customFields,
        categories
      };
    }));
    
    return rowsWithExtras;
  },

  async getRowsByCategory(categoryId: string): Promise<Row[]> {
    // Get row IDs that have this category
    const rowIds = await rowCategoryService.getRowsByCategory(categoryId);
    
    if (rowIds.length === 0) {
      return [];
    }
    
    // Fetch the rows
    const { data, error } = await supabase
      .from('rows')
      .select(`
        *,
        plot:plots(
          *,
          category:plot_categories(*)
        )
      `)
      .in('id', rowIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Fetch custom fields and categories for each row
    const rowsWithExtras = await Promise.all((data || []).map(async (row) => {
      const [customFields, categories] = await Promise.all([
        rowFieldService.getFieldValues(row.id),
        rowCategoryService.getRowCategories(row.id)
      ]);
      
      return {
        ...row,
        custom_fields: customFields,
        categories
      };
    }));
    
    return rowsWithExtras;
  },

  async createRow(row: Omit<Row, 'id' | 'created_at' | 'updated_at' | 'custom_fields' | 'categories'>): Promise<Row> {
    // Extract custom fields and categories if they exist
    const { custom_fields, categories, ...rowData } = row as any;
    
    // Set position if not provided
    if (rowData.plot_id && !rowData.position) {
      const { data: existingRows } = await supabase
        .from('rows')
        .select('position')
        .eq('plot_id', rowData.plot_id)
        .order('position', { ascending: false })
        .limit(1);
      
      rowData.position = existingRows && existingRows.length > 0 ? (existingRows[0].position + 1) : 0;
    }
    
    // Create the row
    const { data, error } = await supabase
      .from('rows')
      .insert(rowData)
      .select(`
        *,
        plot:plots(
          *,
          category:plot_categories(*)
        )
      `)
      .single();

    if (error) throw error;
    
    // Add custom fields if provided
    if (custom_fields && custom_fields.length > 0) {
      await rowFieldService.setMultipleFieldValues(
        data.id, 
        custom_fields.map((cf: any) => ({ fieldId: cf.field_id, value: cf.value }))
      );
    }
    
    // Add categories if provided
    if (categories && categories.length > 0) {
      await rowCategoryService.setRowCategories(
        data.id,
        categories.map((c: any) => typeof c === 'string' ? c : c.id)
      );
    }
    
    // Fetch the complete row with custom fields and categories
    return this.getRowById(data.id);
  },

  async updateRow(id: string, updates: Partial<Row>): Promise<Row> {
    // Extract custom fields and categories if they exist
    const { custom_fields, categories, ...rowUpdates } = updates as any;
    
    // Update the row
    const { data, error } = await supabase
      .from('rows')
      .update({
        ...rowUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        plot:plots(
          *,
          category:plot_categories(*)
        )
      `)
      .single();

    if (error) throw error;
    
    // Update custom fields if provided
    if (custom_fields && custom_fields.length > 0) {
      await rowFieldService.setMultipleFieldValues(
        id, 
        custom_fields.map((cf: any) => ({ fieldId: cf.field_id, value: cf.value }))
      );
    }
    
    // Update categories if provided
    if (categories) {
      await rowCategoryService.setRowCategories(
        id,
        categories.map((c: any) => typeof c === 'string' ? c : c.id)
      );
    }
    
    // Fetch the complete row with custom fields and categories
    return this.getRowById(id);
  },

  async deleteRow(id: string): Promise<void> {
    // Delete will cascade to field values and category assignments
    const { error } = await supabase
      .from('rows')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
  
  async getRowById(id: string): Promise<Row> {
    const { data, error } = await supabase
      .from('rows')
      .select(`
        *,
        plot:plots(
          *,
          category:plot_categories(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Fetch custom fields and categories
    const [customFields, categories] = await Promise.all([
      rowFieldService.getFieldValues(id),
      rowCategoryService.getRowCategories(id)
    ]);
    
    return {
      ...data,
      custom_fields: customFields,
      categories
    };
  },
  
  async updateRowPositions(plotId: string, rowPositions: { id: string, position: number }[]): Promise<void> {
    // Update each row's position
    for (const { id, position } of rowPositions) {
      const { error } = await supabase
        .from('rows')
        .update({ position, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('plot_id', plotId);
      
      if (error) throw error;
    }
  },
  
  async updateRowStatus(id: string, status: Row['status']): Promise<Row> {
    const { data, error } = await supabase
      .from('rows')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        plot:plots(
          *,
          category:plot_categories(*)
        )
      `)
      .single();

    if (error) throw error;
    
    // Fetch custom fields and categories
    const [customFields, categories] = await Promise.all([
      rowFieldService.getFieldValues(id),
      rowCategoryService.getRowCategories(id)
    ]);
    
    return {
      ...data,
      custom_fields: customFields,
      categories
    };
  }
};