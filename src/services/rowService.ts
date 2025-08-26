import { supabase } from '../lib/supabase';
import type { Row } from '../types/database';

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
    return data || [];
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
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createRow(row: Omit<Row, 'id' | 'created_at' | 'updated_at'>): Promise<Row> {
    const { data, error } = await supabase
      .from('rows')
      .insert(row)
      .select(`
        *,
        plot:plots(
          *,
          category:plot_categories(*)
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateRow(id: string, updates: Partial<Row>): Promise<Row> {
    const { data, error } = await supabase
      .from('rows')
      .update(updates)
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
    return data;
  },

  async deleteRow(id: string): Promise<void> {
    const { error } = await supabase
      .from('rows')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};