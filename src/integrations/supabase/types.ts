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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          property_id: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          property_id?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          property_id?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          email_verified: boolean | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          verification_token: string | null
          verification_token_expires_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          verification_token?: string | null
          verification_token_expires_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          verification_token?: string | null
          verification_token_expires_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          area: number
          bathrooms: number | null
          bedrooms: number | null
          city: string
          country: string | null
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          is_active: boolean | null
          is_sponsored: boolean | null
          lat: number | null
          lng: number | null
          postal_code: string | null
          price: number
          property_type: string
          sponsored_by: string | null
          sponsored_until: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
          whatsapp_enabled: boolean | null
        }
        Insert: {
          address: string
          area: number
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          country?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_sponsored?: boolean | null
          lat?: number | null
          lng?: number | null
          postal_code?: string | null
          price: number
          property_type: string
          sponsored_by?: string | null
          sponsored_until?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
          whatsapp_enabled?: boolean | null
        }
        Update: {
          address?: string
          area?: number
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          country?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_sponsored?: boolean | null
          lat?: number | null
          lng?: number | null
          postal_code?: string | null
          price?: number
          property_type?: string
          sponsored_by?: string | null
          sponsored_until?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
          whatsapp_enabled?: boolean | null
        }
        Relationships: []
      }
      property_images: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_primary: boolean | null
          property_id: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          property_id: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          property_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          property_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          property_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          property_id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_reports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bans: {
        Row: {
          admin_id: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          is_permanent: boolean
          reason: string
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_permanent?: boolean
          reason: string
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_permanent?: boolean
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewed_user_id: string
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewed_user_id: string
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewed_user_id?: string
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_warnings: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      report_reason:
        | "spam"
        | "inappropriate_content"
        | "fraud"
        | "false_info"
        | "other"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      report_reason: [
        "spam",
        "inappropriate_content",
        "fraud",
        "false_info",
        "other",
      ],
    },
  },
} as const
