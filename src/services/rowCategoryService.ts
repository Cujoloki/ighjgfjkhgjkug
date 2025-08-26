import { supabase } from '../lib/supabase';
import type { RowCategory, RowCategoryAssignment } from '../types/database';

export const rowCategoryService = {
  // Category CRUD operations
  async getCategories(): Promise<RowCategory[]> {
    const { data, error } = await supabase
      .from('row_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createCategory(category: Omit<RowCategory, 'id' | 'created_at'>): Promise<RowCategory> {
    const { data, error } = await supabase
      .from('row_categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, updates: Partial<RowCategory>): Promise<RowCategory> {
    const { data, error } = await supabase
      .from('row_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('row_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Category Assignment operations
  async getRowCategories(rowId: string): Promise<RowCategory[]> {
    const { data, error } = await supabase
      .from('row_category_assignments')
      .select(`
        category:row_categories(*)
      `)
      .eq('row_id', rowId);

    if (error) throw error;
    
    // Extract the category from each assignment
    return (data || []).map(item => item.category);
  },

  async assignCategory(rowId: string, categoryId: string): Promise<RowCategoryAssignment> {
    const { data, error } = await supabase
      .from('row_category_assignments')
      .insert({
        row_id: rowId,
        category_id: categoryId
      })
      .select(`
        *,
        category:row_categories(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async removeCategory(rowId: string, categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('row_category_assignments')
      .delete()
      .eq('row_id', rowId)
      .eq('category_id', categoryId);

    if (error) throw error;
  },

  async setRowCategories(rowId: string, categoryIds: string[]): Promise<void> {
    // First, remove all existing categories
    const { error: deleteError } = await supabase
      .from('row_category_assignments')
      .delete()
      .eq('row_id', rowId);

    if (deleteError) throw deleteError;

    // Then, add the new categories
    if (categoryIds.length > 0) {
      const insertData = categoryIds.map(categoryId => ({
        row_id: rowId,
        category_id: categoryId
      }));

      const { error: insertError } = await supabase
        .from('row_category_assignments')
        .insert(insertData);

      if (insertError) throw insertError;
    }
  },

  // Get rows by category
  async getRowsByCategory(categoryId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('row_category_assignments')
      .select('row_id')
      .eq('category_id', categoryId);

    if (error) throw error;
    return (data || []).map(item => item.row_id);
  }
};