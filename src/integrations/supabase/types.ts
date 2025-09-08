export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      base_product_types: {
        Row: {
          created_at: string
          id: string
          product_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_name: string
        }
        Update: {
          created_at?: string
          id?: string
          product_name?: string
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          event_id: string
          hedonic_appearance: number
          hedonic_flavor: number
          hedonic_odor: number
          hedonic_overall_liking: number
          hedonic_texture: number
          id: string
          jar_ratings: Json
          product_type_id: string
          sample_id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          event_id: string
          hedonic_appearance: number
          hedonic_flavor: number
          hedonic_odor: number
          hedonic_overall_liking: number
          hedonic_texture: number
          id?: string
          jar_ratings: Json
          product_type_id: string
          sample_id: string
          timestamp?: string
          user_id: string
        }
        Update: {
          event_id?: string
          hedonic_appearance?: number
          hedonic_flavor?: number
          hedonic_odor?: number
          hedonic_overall_liking?: number
          hedonic_texture?: number
          id?: string
          jar_ratings?: Json
          product_type_id?: string
          sample_id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_sample_id_fkey"
            columns: ["sample_id"]
            isOneToOne: false
            referencedRelation: "samples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          date: string
          id: string
          randomization_complete: boolean
          status: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          randomization_complete?: boolean
          status?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          randomization_complete?: boolean
          status?: string
        }
        Relationships: []
      }
      jar_attributes: {
        Row: {
          base_product_type_id: string | null
          created_at: string
          id: string
          name_en: string
          name_hr: string
          product_type_id: string | null
          scale_en: string[]
          scale_hr: string[]
        }
        Insert: {
          base_product_type_id?: string | null
          created_at?: string
          id?: string
          name_en: string
          name_hr: string
          product_type_id?: string | null
          scale_en: string[]
          scale_hr: string[]
        }
        Update: {
          base_product_type_id?: string | null
          created_at?: string
          id?: string
          name_en?: string
          name_hr?: string
          product_type_id?: string | null
          scale_en?: string[]
          scale_hr?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "jar_attributes_base_product_type_id_fkey"
            columns: ["base_product_type_id"]
            isOneToOne: false
            referencedRelation: "base_product_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jar_attributes_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
        ]
      }
      product_types: {
        Row: {
          base_code: string
          base_product_type_id: string | null
          created_at: string
          customer_code: string
          display_order: number
          event_id: string
          has_randomization: boolean
          id: string
          product_name: string
        }
        Insert: {
          base_code: string
          base_product_type_id?: string | null
          created_at?: string
          customer_code: string
          display_order: number
          event_id: string
          has_randomization?: boolean
          id?: string
          product_name: string
        }
        Update: {
          base_code?: string
          base_product_type_id?: string | null
          created_at?: string
          customer_code?: string
          display_order?: number
          event_id?: string
          has_randomization?: boolean
          id?: string
          product_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_types_base_product_type_id_fkey"
            columns: ["base_product_type_id"]
            isOneToOne: false
            referencedRelation: "base_product_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      randomizations: {
        Row: {
          created_at: string
          id: string
          product_type_id: string
          randomization_table: Json
        }
        Insert: {
          created_at?: string
          id?: string
          product_type_id: string
          randomization_table: Json
        }
        Update: {
          created_at?: string
          id?: string
          product_type_id?: string
          randomization_table?: Json
        }
        Relationships: [
          {
            foreignKeyName: "randomizations_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
        ]
      }
      samples: {
        Row: {
          blind_code: string | null
          brand: string
          created_at: string
          id: string
          images_details: string[] | null
          images_packaging: string | null
          images_prepared: string | null
          product_type_id: string
          retailer_code: string
        }
        Insert: {
          blind_code?: string | null
          brand: string
          created_at?: string
          id?: string
          images_details?: string[] | null
          images_packaging?: string | null
          images_prepared?: string | null
          product_type_id: string
          retailer_code: string
        }
        Update: {
          blind_code?: string | null
          brand?: string
          created_at?: string
          id?: string
          images_details?: string[] | null
          images_packaging?: string | null
          images_prepared?: string | null
          product_type_id?: string
          retailer_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "samples_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          evaluator_position: number | null
          id: string
          is_active: boolean
          password: string
          role: string
          username: string
        }
        Insert: {
          created_at?: string
          evaluator_position?: number | null
          id?: string
          is_active?: boolean
          password: string
          role: string
          username: string
        }
        Update: {
          created_at?: string
          evaluator_position?: number | null
          id?: string
          is_active?: boolean
          password?: string
          role?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_authenticated_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_evaluator: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
