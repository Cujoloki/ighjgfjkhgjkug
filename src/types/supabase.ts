export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      plots: {
        Row: {
          id: string
          name: string
          description: string | null
          category_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plot_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          created_at?: string
        }
      }
      rows: {
        Row: {
          id: string
          plot_id: string | null
          name: string
          variety: string | null
          planted_date: string | null
          expected_harvest: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plot_id?: string | null
          name: string
          variety?: string | null
          planted_date?: string | null
          expected_harvest?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plot_id?: string | null
          name?: string
          variety?: string | null
          planted_date?: string | null
          expected_harvest?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}