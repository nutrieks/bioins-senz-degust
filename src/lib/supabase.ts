
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          role: string
          evaluator_position: number | null
          is_active: boolean
          password: string
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          role: string
          evaluator_position?: number | null
          is_active?: boolean
          password: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          role?: string
          evaluator_position?: number | null
          is_active?: boolean
          password?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          date: string
          status: string
          created_at: string
          randomization_complete: boolean
        }
        Insert: {
          id?: string
          date: string
          status?: string
          created_at?: string
          randomization_complete?: boolean
        }
        Update: {
          id?: string
          date?: string
          status?: string
          created_at?: string
          randomization_complete?: boolean
        }
      }
      base_product_types: {
        Row: {
          id: string
          product_name: string
          created_at: string
        }
        Insert: {
          id?: string
          product_name: string
          created_at?: string
        }
        Update: {
          id?: string
          product_name?: string
          created_at?: string
        }
      }
      product_types: {
        Row: {
          id: string
          event_id: string
          customer_code: string
          product_name: string
          base_code: string
          display_order: number
          base_product_type_id: string | null
          has_randomization: boolean
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          customer_code: string
          product_name: string
          base_code: string
          display_order: number
          base_product_type_id?: string | null
          has_randomization?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          customer_code?: string
          product_name?: string
          base_code?: string
          display_order?: number
          base_product_type_id?: string | null
          has_randomization?: boolean
          created_at?: string
        }
      }
      samples: {
        Row: {
          id: string
          product_type_id: string
          brand: string
          retailer_code: string
          blind_code: string | null
          images_prepared: string | null
          images_packaging: string | null
          images_details: string[]
          created_at: string
        }
        Insert: {
          id?: string
          product_type_id: string
          brand: string
          retailer_code: string
          blind_code?: string | null
          images_prepared?: string | null
          images_packaging?: string | null
          images_details?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          product_type_id?: string
          brand?: string
          retailer_code?: string
          blind_code?: string | null
          images_prepared?: string | null
          images_packaging?: string | null
          images_details?: string[]
          created_at?: string
        }
      }
      jar_attributes: {
        Row: {
          id: string
          product_type_id: string
          name_hr: string
          name_en: string
          scale_hr: string[]
          scale_en: string[]
          created_at: string
        }
        Insert: {
          id?: string
          product_type_id: string
          name_hr: string
          name_en: string
          scale_hr: string[]
          scale_en: string[]
          created_at?: string
        }
        Update: {
          id?: string
          product_type_id?: string
          name_hr?: string
          name_en?: string
          scale_hr?: string[]
          scale_en?: string[]
          created_at?: string
        }
      }
      randomizations: {
        Row: {
          id: string
          product_type_id: string
          randomization_table: any
          created_at: string
        }
        Insert: {
          id?: string
          product_type_id: string
          randomization_table: any
          created_at?: string
        }
        Update: {
          id?: string
          product_type_id?: string
          randomization_table?: any
          created_at?: string
        }
      }
      evaluations: {
        Row: {
          id: string
          user_id: string
          sample_id: string
          product_type_id: string
          event_id: string
          hedonic_appearance: number
          hedonic_odor: number
          hedonic_texture: number
          hedonic_flavor: number
          hedonic_overall_liking: number
          jar_ratings: any
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          sample_id: string
          product_type_id: string
          event_id: string
          hedonic_appearance: number
          hedonic_odor: number
          hedonic_texture: number
          hedonic_flavor: number
          hedonic_overall_liking: number
          jar_ratings: any
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          sample_id?: string
          product_type_id?: string
          event_id?: string
          hedonic_appearance?: number
          hedonic_odor?: number
          hedonic_texture?: number
          hedonic_flavor?: number
          hedonic_overall_liking?: number
          jar_ratings?: any
          timestamp?: string
        }
      }
    }
  }
}
