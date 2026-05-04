-- PROAMS Management System Master Schema SUPABASE
-- Database: PostgreSQL (Supabase)
-- This is the merged industrial-grade schema combining the DB export and the Master Blueprint.

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE asset_status AS ENUM ('AVAILABLE', 'RESERVED', 'OUT', 'PENDING_QC', 'MAINTENANCE', 'QUARANTINED');
CREATE TYPE item_condition AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');
CREATE TYPE project_status AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED');
CREATE TYPE user_role AS ENUM ('ADMIN', 'TECH', 'PM', 'INV');
CREATE TYPE item_type AS ENUM ('ASSET', 'CONSUMABLE');
CREATE TYPE reservation_status AS ENUM ('RESERVED', 'OUT', 'RETURNED');

-- 0. USER PROFILES
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    email text NOT NULL UNIQUE,
    role user_role DEFAULT 'TECH',
    first_name text,
    last_name text,
    is_active boolean DEFAULT true,
    updated_at timestamptz DEFAULT now()
);

-- 1. CATALOG LEVEL
CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.subcategories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
    code text NOT NULL UNIQUE,
    description text null,
    name text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- The best option is to make the subcategory code unique within its category, not globally unique. (AUD-REC, VID-REC)
-- 1. Remove the existing global unique constraint
ALTER TABLE public.subcategories DROP CONSTRAINT subcategories_code_key;
-- 2. Add a composite unique constraint (category_id + code)
ALTER TABLE public.subcategories ADD CONSTRAINT subcategories_category_code_unique UNIQUE (category_id, code);



CREATE TABLE public.models (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    subcategory_id uuid REFERENCES public.subcategories(id) ON DELETE CASCADE,
    code text NOT NULL UNIQUE,
    brand text NOT NULL,
    name text NOT NULL,
    specs jsonb,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 2. PHYSICAL INVENTORY
CREATE TABLE public.suppliers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    contact_name text,
    email text,
    phone text,
    website text,
    address text,
    notes text,
    rating smallint,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.storage_locations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id uuid REFERENCES public.storage_locations(id),
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.assets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id uuid REFERENCES public.models(id),
    supplier_id uuid REFERENCES public.suppliers(id),
    asset_code text NOT NULL UNIQUE,
    serial_number text,
    description text,
    weight text,
    invoice_number text,
    status asset_status DEFAULT 'AVAILABLE',
    condition item_condition DEFAULT 'EXCELLENT',
    location_id uuid REFERENCES public.storage_locations(id),
    case_number text,
    purchase_date date,
    purchase_cost numeric,
    warranty_expiry date,
    last_maintenance date,
    next_maintenance date,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.consumables (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id uuid REFERENCES public.models(id),
    location_id uuid REFERENCES public.storage_locations(id),
    supplier_id uuid REFERENCES public.suppliers(id),
    quantity integer NOT NULL DEFAULT 0,
    low_stock_threshold integer DEFAULT 5,
    unit_type text, 
    updated_at timestamptz DEFAULT now()
);

-- 3. PROJECTS & BOOKINGS
CREATE TABLE public.venues (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    address text,
    room_dimensions text,
    ceiling_height text,
    dock_details text,
    freight_elevator text,
    power_access text,
    contact_name text,
    contact_phone text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.projects (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    type text,
    client_name text,
    venue_id uuid REFERENCES public.venues(id),
    start_date date,
    end_date date,
    load_in_time timestamptz,
    show_start_time timestamptz,
    show_end_time timestamptz,
    load_out_time timestamptz,
    onsite_contact_name text,
    onsite_contact_phone text,
    dress_code text,
    tech_notes text,
    status project_status DEFAULT 'PLANNING',
    description text,
    project_manager_id uuid REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.project_equipment (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    asset_id uuid REFERENCES public.assets(id),
    model_id uuid REFERENCES public.models(id),
    quantity integer DEFAULT 1,
    status reservation_status DEFAULT 'RESERVED',
    is_sub_rental boolean DEFAULT false,
    rental_company text,
    requested_date date,
    returned_date date,
    CONSTRAINT asset_or_model CHECK (
        (asset_id IS NOT NULL AND model_id IS NULL) OR 
        (asset_id IS NULL AND model_id IS NOT NULL)
    )
);

-- 4. KITS
CREATE TABLE public.kits (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.kit_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    kit_id uuid REFERENCES public.kits(id) ON DELETE CASCADE,
    item_type item_type NOT NULL,
    asset_id uuid REFERENCES public.assets(id),
    model_id uuid REFERENCES public.models(id),
    quantity integer DEFAULT 1,
    CONSTRAINT kit_asset_or_model CHECK (
        (item_type = 'ASSET' AND asset_id IS NOT NULL AND model_id IS NULL) OR 
        (item_type = 'CONSUMABLE' AND asset_id IS NULL AND model_id IS NOT NULL)
    )
);

-- 5. MAINTENANCE & ADMIN
CREATE TABLE public.maintenance_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id uuid REFERENCES public.assets(id),
    service_date date NOT NULL,
    technician text,
    description text NOT NULL,
    cost numeric,
    parts_replaced text,
    photo_url text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.activity_log (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.profiles(id),
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    action text NOT NULL,
    old_value text,
    new_value text,
    created_at timestamptz DEFAULT now()
);


-- RLS Policies
--1. Enable RLS on all tables
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
    END LOOP; -- Corrected syntax: space between END and LOOP
END $$;

-- Role Helper Functions
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT role = 'ADMIN' FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;


--2. RLS for all the tables based on the roles
-- PROFILES
CREATE POLICY "Profiles: Users view own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles: Users update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles: Admins full access" ON public.profiles TO authenticated USING (is_admin());

-- CATALOG (Categories, Subcategories, Models)
CREATE POLICY "Catalog: Read for all" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Catalog: Read for all" ON public.subcategories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Catalog: Read for all" ON public.models FOR SELECT TO authenticated USING (true);
CREATE POLICY "Catalog: INV/Admin manage" ON public.categories FOR ALL TO authenticated USING (get_my_role() IN ('INV', 'ADMIN'));
CREATE POLICY "Catalog: INV/Admin manage" ON public.subcategories FOR ALL TO authenticated USING (get_my_role() IN ('INV', 'ADMIN'));
CREATE POLICY "Catalog: INV/Admin manage" ON public.models FOR ALL TO authenticated USING (get_my_role() IN ('INV', 'ADMIN'));

-- LOGISTICS (Suppliers, Venues, Locations)
CREATE POLICY "Logistics: Read for all" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Logistics: Read for all" ON public.venues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Logistics: Read for all" ON public.storage_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Logistics: Admin/INV/PM manage suppliers" ON public.suppliers FOR ALL TO authenticated USING (get_my_role() IN ('ADMIN', 'INV', 'PM'));
CREATE POLICY "Logistics: Admin/INV/PM manage venues" ON public.venues FOR ALL TO authenticated USING (get_my_role() IN ('ADMIN', 'INV', 'PM'));
CREATE POLICY "Logistics: Admin/INV manage locations" ON public.storage_locations FOR ALL TO authenticated USING (get_my_role() IN ('ADMIN', 'INV'));

-- ASSETS & CONSUMABLES
CREATE POLICY "Inventory: Read for all" ON public.assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Inventory: Read for all" ON public.consumables FOR SELECT TO authenticated USING (true);
CREATE POLICY "Consumables: INV and Admin can insert" ON public.consumables FOR INSERT TO authenticated WITH CHECK (get_my_role() IN ('INV', 'ADMIN'));
CREATE POLICY "Inventory: INV and Admin manage" ON public.assets FOR ALL TO authenticated USING (get_my_role() IN ('INV', 'ADMIN'));
CREATE POLICY "Inventory: Techs update status" ON public.assets FOR UPDATE TO authenticated 
USING (get_my_role() = 'TECH') WITH CHECK (get_my_role() = 'TECH');

-- KITS
CREATE POLICY "Kits: Read for all" ON public.kits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Kits: Read for all" ON public.kit_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Kits: INV and Admin manage" ON public.kits FOR ALL TO authenticated USING (get_my_role() IN ('INV', 'ADMIN'));
CREATE POLICY "Kits: INV and Admin manage items" ON public.kit_items FOR ALL TO authenticated USING (get_my_role() IN ('INV', 'ADMIN'));

-- PROJECTS
CREATE POLICY "Projects: Read for all" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Projects: Read for all" ON public.project_equipment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Projects: PM and Admin manage" ON public.projects FOR ALL TO authenticated USING (get_my_role() IN ('PM', 'ADMIN'));
CREATE POLICY "Projects: PM and Admin manage" ON public.project_equipment FOR ALL TO authenticated USING (get_my_role() IN ('PM', 'ADMIN'));

-- MAINTENANCE & LOGS
CREATE POLICY "Maint: Read for all" ON public.maintenance_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Maint: Techs and above can create" ON public.maintenance_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Maint: Admin/INV full control" ON public.maintenance_logs FOR ALL TO authenticated USING (get_my_role() IN ('ADMIN', 'INV'));
CREATE POLICY "Logs: Users can insert" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Logs: Admins view" ON public.activity_log FOR SELECT TO authenticated USING (is_admin());


-- 1. Create the function that Supabase will call new auth user into profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id, 
    new.email, 
    'TECH' -- This sets your default role
  );
  RETURN new;
END;
$$;

-- 2. Create the trigger on the auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();



  -- Asset Attachments Table
CREATE TABLE public.asset_attachments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id uuid REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
    type text NOT NULL CHECK (type IN ('image', 'document', 'link')),
    name text,
    url text NOT NULL,
    is_primary boolean DEFAULT false,
    sort_order int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);
-- RLS Policies
ALTER TABLE public.asset_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attachments: Read for all" ON public.asset_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Attachments: Techs and above can create" ON public.asset_attachments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Attachments: Techs and above can delete" ON public.asset_attachments FOR DELETE TO authenticated USING (true);
CREATE POLICY "Attachments: Admin/INV can update" ON public.asset_attachments FOR UPDATE TO authenticated USING (get_my_role() IN ('ADMIN', 'INV'));
-- Index for fast queries
CREATE INDEX idx_asset_attachments_asset_id ON public.asset_attachments(asset_id);
CREATE INDEX idx_asset_attachments_sort_order ON public.asset_attachments(sort_order);

-- Create bucket for asset attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('asset-attachments', 'asset-attachments', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
-- Storage policies (read/write for authenticated users)
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'asset-attachments');
CREATE POLICY "Anyone can view" ON storage.objects FOR SELECT USING (bucket_id = 'asset-attachments');
CREATE POLICY "Owner can delete" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
---



-- Asset trigger log trigger function-- Fixed: Asset trigger
CREATE OR REPLACE FUNCTION public.log_asset_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := NULLIF(current_setting('auth.uid', true), '')::uuid;
  
  INSERT INTO public.activity_log (user_id, entity_type, entity_id, action, old_value, new_value)
  VALUES (
    v_user_id,
    'asset',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'INSERT' THEN 'created' 
         WHEN TG_OP = 'UPDATE' THEN 'updated' 
         WHEN TG_OP = 'DELETE' THEN 'deleted' END,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_asset_change ON public.assets;
CREATE TRIGGER on_asset_change
AFTER INSERT OR UPDATE OR DELETE ON public.assets
FOR EACH ROW EXECUTE FUNCTION public.log_asset_change();
-- Fixed: Maintenance trigger
CREATE OR REPLACE FUNCTION public.log_maintenance()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := NULLIF(current_setting('auth.uid', true), '')::uuid;
  INSERT INTO public.activity_log (user_id, entity_type, entity_id, action, new_value)
  VALUES (
    v_user_id,
    'asset',
    NEW.asset_id,
    'maintenance_log_added',
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_maintenance_log ON public.maintenance_logs;
CREATE TRIGGER on_maintenance_log
AFTER INSERT ON public.maintenance_logs
FOR EACH ROW EXECUTE FUNCTION public.log_maintenance();
-- Fixed: Attachments trigger
CREATE OR REPLACE FUNCTION public.log_attachment()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := NULLIF(current_setting('auth.uid', true), '')::uuid;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_log (user_id, entity_type, entity_id, action, new_value)
    VALUES (v_user_id, 'attachment', NEW.id, 'attachment_added', to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.activity_log (user_id, entity_type, entity_id, action, old_value)
    VALUES (v_user_id, 'attachment', OLD.id, 'attachment_deleted', to_jsonb(OLD));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_attachment_add ON public.asset_attachments;
CREATE TRIGGER on_attachment_add
AFTER INSERT OR DELETE ON public.asset_attachments
FOR EACH ROW EXECUTE FUNCTION public.log_attachment();



-- KITS
CREATE POLICY "Kits: Read for all" ON public.kits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Kits: Read for all" ON public.kit_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Kits: INV and Admin manage" ON public.kits FOR ALL TO authenticated USING (get_my_role() IN ('INV', 'ADMIN'));
CREATE POLICY "Kits: INV and Admin manage items" ON public.kit_items FOR ALL TO authenticated USING (get_my_role() IN ('INV', 'ADMIN'));








-- =============================================
-- ACTIVITY LOG TRIGGERS FOR ALL TABLES
-- =============================================
-- 1. CONSUMABLES
CREATE OR REPLACE FUNCTION public.log_consumable_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := NULLIF(current_setting('auth.uid', true), '')::uuid;
  
  INSERT INTO public.activity_log (user_id, entity_type, entity_id, action, old_value, new_value)
  VALUES (
    v_user_id,
    'consumable',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'INSERT' THEN 'created' 
         WHEN TG_OP = 'UPDATE' THEN 'updated' 
         WHEN TG_OP = 'DELETE' THEN 'deleted' END,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_consumable_change ON public.consumables;
CREATE TRIGGER on_consumable_change
AFTER INSERT OR UPDATE OR DELETE ON public.consumables
FOR EACH ROW EXECUTE FUNCTION public.log_consumable_change();
-- 2. KITS
CREATE OR REPLACE FUNCTION public.log_kit_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := NULLIF(current_setting('auth.uid', true), '')::uuid;
  
  INSERT INTO public.activity_log (user_id, entity_type, entity_id, action, old_value, new_value)
  VALUES (
    v_user_id,
    'kit',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'INSERT' THEN 'created' 
         WHEN TG_OP = 'UPDATE' THEN 'updated' 
         WHEN TG_OP = 'DELETE' THEN 'deleted' END,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_kit_change ON public.kits;
CREATE TRIGGER on_kit_change
AFTER INSERT OR UPDATE OR DELETE ON public.kits
FOR EACH ROW EXECUTE FUNCTION public.log_kit_change();
-- 3. KIT_ITEMS
CREATE OR REPLACE FUNCTION public.log_kit_item_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_action text;
BEGIN
  v_user_id := NULLIF(current_setting('auth.uid', true), '')::uuid;
  
  v_action := CASE 
    WHEN TG_OP = 'INSERT' THEN 'item_added_to_kit' 
    WHEN TG_OP = 'UPDATE' THEN 'kit_item_updated' 
    WHEN TG_OP = 'DELETE' THEN 'item_removed_from_kit' 
  END;
  
  INSERT INTO public.activity_log (user_id, entity_type, entity_id, action, old_value, new_value)
  VALUES (
    v_user_id,
    'kit_item',
    COALESCE(NEW.id, OLD.id),
    v_action,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_kit_item_change ON public.kit_items;
CREATE TRIGGER on_kit_item_change
AFTER INSERT OR UPDATE OR DELETE ON public.kit_items
FOR EACH ROW EXECUTE FUNCTION public.log_kit_item_change();
-- 4. CATEGORIES
CREATE OR REPLACE FUNCTION public.log_category_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := NULLIF(current_setting('auth.uid', true), '')::uuid;
  
  INSERT INTO public.activity_log (user_id, entity_type, entity_id, action, old_value, new_value)
  VALUES (
    v_user_id,
    'category',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'INSERT' THEN 'created' 
         WHEN TG_OP = 'UPDATE' THEN 'updated' 
         WHEN TG_OP = 'DELETE' THEN 'deleted' END,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_category_change ON public.categories;
CREATE TRIGGER on_category_change
AFTER INSERT OR UPDATE OR DELETE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.log_category_change();
-- 5. SUBCATEGORIES
CREATE OR REPLACE FUNCTION public.log_subcategory_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := NULLIF(current_setting('auth.uid', true), '')::uuid;
  
  INSERT INTO public.activity_log (user_id, entity_type, entity_id, action, old_value, new_value)
  VALUES (
    v_user_id,
    'subcategory',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'INSERT' THEN 'created' 
         WHEN TG_OP = 'UPDATE' THEN 'updated' 
         WHEN TG_OP = 'DELETE' THEN 'deleted' END,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_subcategory_change ON public.subcategories;
CREATE TRIGGER on_subcategory_change
AFTER INSERT OR UPDATE OR DELETE ON public.subcategories
FOR EACH ROW EXECUTE FUNCTION public.log_subcategory_change();
-- 6. MODELS
CREATE OR REPLACE FUNCTION public.log_model_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := NULLIF(current_setting('auth.uid', true), '')::uuid;
  
  INSERT INTO public.activity_log (user_id, entity_type, entity_id, action, old_value, new_value)
  VALUES (
    v_user_id,
    'model',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'INSERT' THEN 'created' 
         WHEN TG_OP = 'UPDATE' THEN 'updated' 
         WHEN TG_OP = 'DELETE' THEN 'deleted' END,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_model_change ON public.models;
CREATE TRIGGER on_model_change
AFTER INSERT OR UPDATE OR DELETE ON public.models
FOR EACH ROW EXECUTE FUNCTION public.log_model_change();
-- 7. SUPPLIERS
CREATE OR REPLACE FUNCTION public.log_supplier_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := NULLIF(current_setting('auth.uid', true), '')::uuid;
  
  INSERT INTO public.activity_log (user_id, entity_type, entity_id, action, old_value, new_value)
  VALUES (
    v_user_id,
    'supplier',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'INSERT' THEN 'created' 
         WHEN TG_OP = 'UPDATE' THEN 'updated' 
         WHEN TG_OP = 'DELETE' THEN 'deleted' END,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_supplier_change ON public.suppliers;
CREATE TRIGGER on_supplier_change
AFTER INSERT OR UPDATE OR DELETE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION public.log_supplier_change();
-- 8. STORAGE_LOCATIONS
CREATE OR REPLACE FUNCTION public.log_location_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := NULLIF(current_setting('auth.uid', true), '')::uuid;
  
  INSERT INTO public.activity_log (user_id, entity_type, entity_id, action, old_value, new_value)
  VALUES (
    v_user_id,
    'location',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'INSERT' THEN 'created' 
         WHEN TG_OP = 'UPDATE' THEN 'updated' 
         WHEN TG_OP = 'DELETE' THEN 'deleted' END,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_location_change ON public.storage_locations;
CREATE TRIGGER on_location_change
AFTER INSERT OR UPDATE OR DELETE ON public.storage_locations
FOR EACH ROW EXECUTE FUNCTION public.log_location_change();
-- 9. PROJECTS
CREATE OR REPLACE FUNCTION public.log_project_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := NULLIF(current_setting('auth.uid', true), '')::uuid;
  
  INSERT INTO public.activity_log (user_id, entity_type, entity_id, action, old_value, new_value)
  VALUES (
    v_user_id,
    'project',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'INSERT' THEN 'created' 
         WHEN TG_OP = 'UPDATE' THEN 'updated' 
         WHEN TG_OP = 'DELETE' THEN 'deleted' END,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_project_change ON public.projects;
CREATE TRIGGER on_project_change
AFTER INSERT OR UPDATE OR DELETE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.log_project_change();
-- 10. PROJECT_EQUIPMENT
CREATE OR REPLACE FUNCTION public.log_project_equipment_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_action text;
BEGIN
  v_user_id := NULLIF(current_setting('auth.uid', true), '')::uuid;
  
  v_action := CASE 
    WHEN TG_OP = 'INSERT' THEN 'equipment_assigned_to_project' 
    WHEN TG_OP = 'UPDATE' THEN 'project_equipment_updated' 
    WHEN TG_OP = 'DELETE' THEN 'equipment_removed_from_project' 
  END;
  
  INSERT INTO public.activity_log (user_id, entity_type, entity_id, action, old_value, new_value)
  VALUES (
    v_user_id,
    'project_equipment',
    COALESCE(NEW.id, OLD.id),
    v_action,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_project_equipment_change ON public.project_equipment;
CREATE TRIGGER on_project_equipment_change
AFTER INSERT OR UPDATE OR DELETE ON public.project_equipment
FOR EACH ROW EXECUTE FUNCTION public.log_project_equipment_change();
-- 11. VENUES
CREATE OR REPLACE FUNCTION public.log_venue_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := NULLIF(current_setting('auth.uid', true), '')::uuid;
  
  INSERT INTO public.activity_log (user_id, entity_type, entity_id, action, old_value, new_value)
  VALUES (
    v_user_id,
    'venue',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'INSERT' THEN 'created' 
         WHEN TG_OP = 'UPDATE' THEN 'updated' 
         WHEN TG_OP = 'DELETE' THEN 'deleted' END,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_venue_change ON public.venues;
CREATE TRIGGER on_venue_change
AFTER INSERT OR UPDATE OR DELETE ON public.venues
FOR EACH ROW EXECUTE FUNCTION public.log_venue_change();