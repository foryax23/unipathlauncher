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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          id: string
          ip: string | null
          payload: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          payload?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          payload?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      adviser_availability: {
        Row: {
          adviser_id: string
          created_at: string
          end_time: string
          id: string
          start_time: string
          timezone: string
          updated_at: string
          weekday: number
        }
        Insert: {
          adviser_id: string
          created_at?: string
          end_time: string
          id?: string
          start_time: string
          timezone?: string
          updated_at?: string
          weekday: number
        }
        Update: {
          adviser_id?: string
          created_at?: string
          end_time?: string
          id?: string
          start_time?: string
          timezone?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: []
      }
      adviser_time_off: {
        Row: {
          adviser_id: string
          created_at: string
          ends_at: string
          id: string
          reason: string | null
          starts_at: string
        }
        Insert: {
          adviser_id: string
          created_at?: string
          ends_at: string
          id?: string
          reason?: string | null
          starts_at: string
        }
        Update: {
          adviser_id?: string
          created_at?: string
          ends_at?: string
          id?: string
          reason?: string | null
          starts_at?: string
        }
        Relationships: []
      }
      application_events: {
        Row: {
          actor_id: string | null
          application_id: string
          created_at: string
          id: string
          payload: Json
          type: string
        }
        Insert: {
          actor_id?: string | null
          application_id: string
          created_at?: string
          id?: string
          payload?: Json
          type: string
        }
        Update: {
          actor_id?: string | null
          application_id?: string
          created_at?: string
          id?: string
          payload?: Json
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          adviser_id: string | null
          application_data: Json
          course_id: string
          created_at: string
          decision: string | null
          decision_at: string | null
          id: string
          intake_id: string | null
          notes: string | null
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adviser_id?: string | null
          application_data?: Json
          course_id: string
          created_at?: string
          decision?: string | null
          decision_at?: string | null
          id?: string
          intake_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adviser_id?: string | null
          application_data?: Json
          course_id?: string
          created_at?: string
          decision?: string | null
          decision_at?: string | null
          id?: string
          intake_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "course_intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          adviser_id: string | null
          channel: string
          created_at: string
          ends_at: string
          id: string
          notes: string | null
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          adviser_id?: string | null
          channel?: string
          created_at?: string
          ends_at: string
          id?: string
          notes?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          adviser_id?: string | null
          channel?: string
          created_at?: string
          ends_at?: string
          id?: string
          notes?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_intakes: {
        Row: {
          course_id: string
          created_at: string
          deadline_date: string | null
          id: string
          intake_date: string
          seats_left: number | null
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          deadline_date?: string | null
          id?: string
          intake_date: string
          seats_left?: number | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          deadline_date?: string | null
          id?: string
          intake_date?: string
          seats_left?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_intakes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          duration_months: number | null
          entry_requirements: Json
          fee_gbp: number | null
          id: string
          intake_months: number[] | null
          is_active: boolean
          level: string
          name: string
          slug: string
          subject: string
          ucas_points: number | null
          university_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_months?: number | null
          entry_requirements?: Json
          fee_gbp?: number | null
          id?: string
          intake_months?: number[] | null
          is_active?: boolean
          level: string
          name: string
          slug: string
          subject: string
          ucas_points?: number | null
          university_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_months?: number | null
          entry_requirements?: Json
          fee_gbp?: number | null
          id?: string
          intake_months?: number[] | null
          is_active?: boolean
          level?: string
          name?: string
          slug?: string
          subject?: string
          ucas_points?: number | null
          university_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          id: string
          mime_type: string | null
          original_name: string
          size_bytes: number | null
          storage_path: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mime_type?: string | null
          original_name: string
          size_bytes?: number | null
          storage_path: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mime_type?: string | null
          original_name?: string
          size_bytes?: number | null
          storage_path?: string
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      lead_rate_limits: {
        Row: {
          count: number
          ip: string
          updated_at: string
          window_start: string
        }
        Insert: {
          count?: number
          ip: string
          updated_at?: string
          window_start?: string
        }
        Update: {
          count?: number
          ip?: string
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          city: string
          consent: boolean
          created_at: string
          email: string
          id: string
          internal_notes: string | null
          ip: string | null
          lat: number | null
          lng: number | null
          name: string
          next_action_at: string | null
          phone: string
          reason: string | null
          source: string | null
          start_year: string
          status: Database["public"]["Enums"]["lead_status"]
          study_level: string
          subject: string
          user_agent: string | null
          user_id: string | null
          utm: Json | null
        }
        Insert: {
          assigned_to?: string | null
          city: string
          consent?: boolean
          created_at?: string
          email: string
          id?: string
          internal_notes?: string | null
          ip?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          next_action_at?: string | null
          phone: string
          reason?: string | null
          source?: string | null
          start_year: string
          status?: Database["public"]["Enums"]["lead_status"]
          study_level: string
          subject: string
          user_agent?: string | null
          user_id?: string | null
          utm?: Json | null
        }
        Update: {
          assigned_to?: string | null
          city?: string
          consent?: boolean
          created_at?: string
          email?: string
          id?: string
          internal_notes?: string | null
          ip?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          next_action_at?: string | null
          phone?: string
          reason?: string | null
          source?: string | null
          start_year?: string
          status?: Database["public"]["Enums"]["lead_status"]
          study_level?: string
          subject?: string
          user_agent?: string | null
          user_id?: string | null
          utm?: Json | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achieved_grades: Json | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email_verified_at: string | null
          english_test: Json | null
          full_name: string | null
          id: string
          lat: number | null
          lng: number | null
          marketing_consent_email: boolean
          marketing_consent_sms: boolean
          nationality: string | null
          onboarding_complete: boolean
          phone: string | null
          predicted_grades: Json | null
          reason: string | null
          start_year: string | null
          study_level: string | null
          subject: string | null
          updated_at: string
          user_id: string
          visa_status: string | null
        }
        Insert: {
          achieved_grades?: Json | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email_verified_at?: string | null
          english_test?: Json | null
          full_name?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          marketing_consent_email?: boolean
          marketing_consent_sms?: boolean
          nationality?: string | null
          onboarding_complete?: boolean
          phone?: string | null
          predicted_grades?: Json | null
          reason?: string | null
          start_year?: string | null
          study_level?: string | null
          subject?: string | null
          updated_at?: string
          user_id: string
          visa_status?: string | null
        }
        Update: {
          achieved_grades?: Json | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email_verified_at?: string | null
          english_test?: Json | null
          full_name?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          marketing_consent_email?: boolean
          marketing_consent_sms?: boolean
          nationality?: string | null
          onboarding_complete?: boolean
          phone?: string | null
          predicted_grades?: Json | null
          reason?: string | null
          start_year?: string | null
          study_level?: string | null
          subject?: string | null
          updated_at?: string
          user_id?: string
          visa_status?: string | null
        }
        Relationships: []
      }
      shortlists: {
        Row: {
          course_id: string
          course_name: string | null
          created_at: string
          id: string
          level: string | null
          note: string | null
          partner: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          course_name?: string | null
          created_at?: string
          id?: string
          level?: string | null
          note?: string | null
          partner?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          course_name?: string | null
          created_at?: string
          id?: string
          level?: string | null
          note?: string | null
          partner?: string | null
          user_id?: string
        }
        Relationships: []
      }
      threads: {
        Row: {
          adviser_id: string | null
          created_at: string
          id: string
          last_message_at: string | null
          student_id: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          adviser_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          student_id: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          adviser_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          student_id?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      universities: {
        Row: {
          city: string | null
          country: string
          created_at: string
          description: string | null
          id: string
          is_partner: boolean
          logo_url: string | null
          name: string
          ranking: number | null
          region: string | null
          slug: string
          ucas_code: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          is_partner?: boolean
          logo_url?: string | null
          name: string
          ranking?: number | null
          region?: string | null
          slug: string
          ucas_code?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          is_partner?: boolean
          logo_url?: string | null
          name?: string
          ranking?: number | null
          region?: string | null
          slug?: string
          ucas_code?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user" | "adviser"
      application_status:
        | "draft"
        | "submitted"
        | "interview"
        | "offer"
        | "accepted"
        | "rejected"
        | "withdrawn"
        | "enrolled"
      booking_status:
        | "requested"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no_show"
      document_type:
        | "passport"
        | "transcript"
        | "english_test"
        | "personal_statement"
        | "reference"
        | "other"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "converted"
        | "lost"
        | "spam"
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
      app_role: ["admin", "user", "adviser"],
      application_status: [
        "draft",
        "submitted",
        "interview",
        "offer",
        "accepted",
        "rejected",
        "withdrawn",
        "enrolled",
      ],
      booking_status: [
        "requested",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ],
      document_type: [
        "passport",
        "transcript",
        "english_test",
        "personal_statement",
        "reference",
        "other",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "converted",
        "lost",
        "spam",
      ],
    },
  },
} as const
