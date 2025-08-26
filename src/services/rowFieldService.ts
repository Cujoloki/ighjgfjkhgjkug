import { supabase } from '../lib/supabase';
import type { RowFieldDefinition, RowFieldValue } from '../types/database';

export const rowFieldService = {
  // Field Definition CRUD operations
  async getFieldDefinitions(): Promise<RowFieldDefinition[]> {
    const { data, error } = await supabase
      .from('row_field_definitions')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createFieldDefinition(fieldDef: Omit<RowFieldDefinition, 'id' | 'created_at' | 'updated_at'>): Promise<RowFieldDefinition> {
    const { data, error } = await supabase
      .from('row_field_definitions')
      .insert(fieldDef)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFieldDefinition(id: string, updates: Partial<RowFieldDefinition>): Promise<RowFieldDefinition> {
    const { data, error } = await supabase
      .from('row_field_definitions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteFieldDefinition(id: string): Promise<void> {
    const { error } = await supabase
      .from('row_field_definitions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Field Value CRUD operations
  async getFieldValues(rowId: string): Promise<RowFieldValue[]> {
    const { data, error } = await supabase
      .from('row_field_values')
      .select(`
        *,
        field_definition:row_field_definitions(*)
      `)
      .eq('row_id', rowId);

    if (error) throw error;
    return data || [];
  },

  async setFieldValue(rowId: string, fieldId: string, value: any): Promise<RowFieldValue> {
    // Check if value already exists
    const { data: existingData } = await supabase
      .from('row_field_values')
      .select('id')
      .eq('row_id', rowId)
      .eq('field_id', fieldId)
      .single();

    if (existingData) {
      // Update existing value
      const { data, error } = await supabase
        .from('row_field_values')
        .update({
          value,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)
        .select(`
          *,
          field_definition:row_field_definitions(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new value
      const { data, error } = await supabase
        .from('row_field_values')
        .insert({
          row_id: rowId,
          field_id: fieldId,
          value
        })
        .select(`
          *,
          field_definition:row_field_definitions(*)
        `)
        .single();

      if (error) throw error;
      return data;
    }
  },

  async deleteFieldValue(id: string): Promise<void> {
    const { error } = await supabase
      .from('row_field_values')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteAllFieldValues(rowId: string): Promise<void> {
    const { error } = await supabase
      .from('row_field_values')
      .delete()
      .eq('row_id', rowId);

    if (error) throw error;
  },

  // Batch operations
  async setMultipleFieldValues(rowId: string, values: { fieldId: string, value: any }[]): Promise<void> {
    // Create upsert data
    const upsertData = await Promise.all(
      values.map(async ({ fieldId, value }) => {
        // Check if value already exists
        const { data: existingData } = await supabase
          .from('row_field_values')
          .select('id')
          .eq('row_id', rowId)
          .eq('field_id', fieldId)
          .single();

        if (existingData) {
          return {
            id: existingData.id,
            row_id: rowId,
            field_id: fieldId,
            value,
            updated_at: new Date().toISOString()
          };
        } else {
          return {
            row_id: rowId,
            field_id: fieldId,
            value
          };
        }
      })
    );

    const { error } = await supabase
      .from('row_field_values')
      .upsert(upsertData);

    if (error) throw error;
  }
};