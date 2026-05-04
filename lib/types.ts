export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: "ADMIN" | "PM" | "INV" | "TECH"
          first_name: string | null
          last_name: string | null
          is_active: boolean
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: "ADMIN" | "PM" | "INV" | "TECH"
          first_name?: string | null
          last_name?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: "ADMIN" | "PM" | "INV" | "TECH"
          first_name?: string | null
          last_name?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          model_id: string | null
          supplier_id: string | null
          asset_code: string
          serial_number: string | null
          description: string | null
          weight: string | null
          invoice_number: string | null
          status: "AVAILABLE" | "RESERVED" | "OUT" | "PENDING_QC" | "MAINTENANCE" | "QUARANTINED"
          condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR"
          location_id: string | null
          case_number: string | null
          purchase_date: string | null
          purchase_cost: number | null
          warranty_expiry: string | null
          last_maintenance: string | null
          next_maintenance: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          model_id?: string | null
          supplier_id?: string | null
          asset_code: string
          serial_number?: string | null
          description?: string | null
          weight?: string | null
          invoice_number?: string | null
          status?: "AVAILABLE" | "RESERVED" | "OUT" | "PENDING_QC" | "MAINTENANCE" | "QUARANTINED"
          condition?: "EXCELLENT" | "GOOD" | "FAIR" | "POOR"
          location_id?: string | null
          case_number?: string | null
          purchase_date?: string | null
          purchase_cost?: number | null
          warranty_expiry?: string | null
          last_maintenance?: string | null
          next_maintenance?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          model_id?: string | null
          supplier_id?: string | null
          asset_code?: string
          serial_number?: string | null
          description?: string | null
          weight?: string | null
          invoice_number?: string | null
          status?: "AVAILABLE" | "RESERVED" | "OUT" | "PENDING_QC" | "MAINTENANCE" | "QUARANTINED"
          condition?: "EXCELLENT" | "GOOD" | "FAIR" | "POOR"
          location_id?: string | null
          case_number?: string | null
          purchase_date?: string | null
          purchase_cost?: number | null
          warranty_expiry?: string | null
          last_maintenance?: string | null
          next_maintenance?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          type: string | null
          client_name: string | null
          venue_id: string | null
          start_date: string | null
          end_date: string | null
          load_in_time: string | null
          show_start_time: string | null
          show_end_time: string | null
          load_out_time: string | null
          onsite_contact_name: string | null
          onsite_contact_phone: string | null
          dress_code: string | null
          tech_notes: string | null
          status: "PLANNING" | "ACTIVE" | "COMPLETED"
          description: string | null
          project_manager_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type?: string | null
          client_name?: string | null
          venue_id?: string | null
          start_date?: string | null
          end_date?: string | null
          load_in_time?: string | null
          show_start_time?: string | null
          show_end_time?: string | null
          load_out_time?: string | null
          onsite_contact_name?: string | null
          onsite_contact_phone?: string | null
          dress_code?: string | null
          tech_notes?: string | null
          status?: "PLANNING" | "ACTIVE" | "COMPLETED"
          description?: string | null
          project_manager_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string | null
          client_name?: string | null
          venue_id?: string | null
          start_date?: string | null
          end_date?: string | null
          load_in_time?: string | null
          show_start_time?: string | null
          show_end_time?: string | null
          load_out_time?: string | null
          onsite_contact_name?: string | null
          onsite_contact_phone?: string | null
          dress_code?: string | null
          tech_notes?: string | null
          status?: "PLANNING" | "ACTIVE" | "COMPLETED"
          description?: string | null
          project_manager_id?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      storage_locations: {
        Row: {
          id: string
          parent_id: string | null
          name: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          parent_id?: string | null
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string | null
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      models: {
        Row: {
          id: string
          subcategory_id: string | null
          code: string
          brand: string
          name: string
          specs: Json | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          subcategory_id?: string | null
          code: string
          brand: string
          name: string
          specs?: Json | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          subcategory_id?: string | null
          code?: string
          brand?: string
          name?: string
          specs?: Json | null
          is_active?: boolean
          created_at?: string
        }
      }
      consumables: {
        Row: {
          id: string
          model_id: string | null
          location_id: string | null
          quantity: number
          low_stock_threshold: number
          unit_type: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          model_id?: string | null
          location_id?: string | null
          quantity?: number
          low_stock_threshold?: number
          unit_type?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          model_id?: string | null
          location_id?: string | null
          quantity?: number
          low_stock_threshold?: number
          unit_type?: string | null
          updated_at?: string
        }
      }
      venues: {
        Row: {
          id: string
          name: string
          address: string | null
          room_dimensions: string | null
          ceiling_height: string | null
          dock_details: string | null
          freight_elevator: string | null
          power_access: string | null
          contact_name: string | null
          contact_phone: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          room_dimensions?: string | null
          ceiling_height?: string | null
          dock_details?: string | null
          freight_elevator?: string | null
          power_access?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          room_dimensions?: string | null
          ceiling_height?: string | null
          dock_details?: string | null
          freight_elevator?: string | null
          power_access?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      maintenance_logs: {
        Row: {
          id: string
          asset_id: string | null
          service_date: string
          technician: string | null
          description: string
          cost: number | null
          parts_replaced: string | null
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          asset_id?: string | null
          service_date: string
          technician?: string | null
          description: string
          cost?: number | null
          parts_replaced?: string | null
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          asset_id?: string | null
          service_date?: string
          technician?: string | null
          description?: string
          cost?: number | null
          parts_replaced?: string | null
          photo_url?: string | null
          created_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          user_id: string | null
          entity_type: string
          entity_id: string
          action: string
          old_value: string | null
          new_value: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          entity_type: string
          entity_id: string
          action: string
          old_value?: string | null
          new_value?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          entity_type?: string
          entity_id?: string
          action?: string
          old_value?: string | null
          new_value?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Shared interfaces for components
export interface Category {
  id: string;
  name: string;
}

export interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

export interface Model {
  id: string;
  name: string;
  brand: string;
  subcategory_id: string;
}

export interface Location {
  id: string;
  name: string;
}

export interface ConsumableItem {
  id: string;
  model_id: string;
  location_id: string;
  quantity: number;
  low_stock_threshold: number;
  unit_type: string | null;
  model?: { name: string; brand: string; code: string } | null;
  location?: { name: string } | null;
}

export interface Asset {
  id: string;
  asset_code: string;
  serial_number: string | null;
  description: string | null;
  status: string;
  condition: string;
  case_number: string | null;
  location_id: string | null;
  is_active: boolean;
}

export interface MaintenanceLog {
  id: string;
  asset_id: string;
  description: string;
  performed_by: string;
  performed_at: string;
  next_maintenance: string | null;
}

export interface Attachment {
  id: string;
  asset_id: string;
  name: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  notes: string | null;
  rating: number | null;
}