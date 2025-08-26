import { supabase } from '../lib/supabase';
import type { Plot, PlotCategory } from '../types/database';

export const plotService = {
  // Plot CRUD operations
  async getPlots(): Promise<Plot[]> {
    const { data, error } = await supabase
      .from('plots')
      .select(`
        *,
        category:plot_categories(*)
      `)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createPlot(plot: Omit<Plot, 'id' | 'created_at' | 'updated_at'>): Promise<Plot> {
    const { data, error } = await supabase
      .from('plots')
      .insert(plot)
      .select(`
        *,
        category:plot_categories(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updatePlot(id: string, updates: Partial<Plot>): Promise<Plot> {
    const { data, error } = await supabase
      .from('plots')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        category:plot_categories(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async deletePlot(id: string): Promise<void> {
    const { error } = await supabase
      .from('plots')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Category CRUD operations
  async getCategories(): Promise<PlotCategory[]> {
    const { data, error } = await supabase
      .from('plot_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createCategory(category: Omit<PlotCategory, 'id' | 'created_at'>): Promise<PlotCategory> {
    const { data, error } = await supabase
      .from('plot_categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, updates: Partial<PlotCategory>): Promise<PlotCategory> {
    const { data, error } = await supabase
      .from('plot_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('plot_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get plots by category
  async getPlotsByCategory(categoryId: string): Promise<Plot[]> {
    const { data, error } = await supabase
      .from('plots')
      .select(`
        *,
        category:plot_categories(*)
      `)
      .eq('category_id', categoryId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }
};