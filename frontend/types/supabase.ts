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
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          subscription_tier: 'free' | 'pro' | 'business_plus'
          audits_remaining: number
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          subscription_tier?: 'free' | 'pro' | 'business_plus'
          audits_remaining?: number
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          subscription_tier?: 'free' | 'pro' | 'business_plus'
          audits_remaining?: number
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audits: {
        Row: {
          id: string
          user_id: string | null
          requested_email: string
          website_url: string
          created_at: string
          overall_score: number
          performance_score: number
          seo_score: number
          conversion_score: number
          branding_score: number
          presence_score: number
          report_pdf_url: string | null
          raw_data: Json
        }
        Insert: {
          id?: string
          user_id?: string | null
          requested_email: string
          website_url: string
          created_at?: string
          overall_score?: number
          performance_score?: number
          seo_score?: number
          conversion_score?: number
          branding_score?: number
          presence_score?: number
          report_pdf_url?: string | null
          raw_data?: Json
        }
        Update: {
          id?: string
          user_id?: string | null
          requested_email?: string
          website_url?: string
          created_at?: string
          overall_score?: number
          performance_score?: number
          seo_score?: number
          conversion_score?: number
          branding_score?: number
          presence_score?: number
          report_pdf_url?: string | null
          raw_data?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
