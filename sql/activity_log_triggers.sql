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