export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded";

export type TranslationJobStatus =
  | "pending"
  | "extracting"
  | "translating"
  | "qa"
  | "rendering"
  | "completed"
  | "failed";

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          public_code: string;
          stripe_session_id: string | null;
          status: OrderStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          public_code?: string;
          stripe_session_id?: string | null;
          status?: OrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          public_code?: string;
          stripe_session_id?: string | null;
          status?: OrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      translation_jobs: {
        Row: {
          id: string;
          order_id: string;
          file_url: string;
          status: TranslationJobStatus;
          current_phase: string;
          error_log: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          file_url: string;
          status?: TranslationJobStatus;
          current_phase?: string;
          error_log?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          file_url?: string;
          status?: TranslationJobStatus;
          current_phase?: string;
          error_log?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "translation_jobs_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      order_status: OrderStatus;
      translation_job_status: TranslationJobStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience Type Aliases
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Order = Tables<"orders">;
export type OrderInsert = TablesInsert<"orders">;
export type OrderUpdate = TablesUpdate<"orders">;

export type TranslationJob = Tables<"translation_jobs">;
export type TranslationJobInsert = TablesInsert<"translation_jobs">;
export type TranslationJobUpdate = TablesUpdate<"translation_jobs">;
