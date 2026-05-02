import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function logActivity(
  entityType: string,
  entityId: string,
  action: string,
  oldValue?: Record<string, unknown> | null,
  newValue?: Record<string, unknown> | null
) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("activity_log").insert({
    user_id: user.id,
    entity_type: entityType,
    entity_id: entityId,
    action,
    old_value: oldValue ? JSON.stringify(oldValue) : null,
    new_value: newValue ? JSON.stringify(newValue) : null,
  });
}

export async function softDeleteAsset(assetId: string, assetCode: string, confirmCode: string) {
  const supabase = await createClient();
  
  if (confirmCode !== assetCode) {
    return { error: "Asset code mismatch. Please type the exact asset code to confirm deletion." };
  }

  const { data: oldAsset } = await supabase.from("assets").select("*, model:models(name), location:storage_locations(name)").eq("id", assetId).single();

  const { error } = await supabase
    .from("assets")
    .update({ is_active: false })
    .eq("id", assetId);

  if (error) {
return { error: error.message };
  }

  return { success: true };
}

export async function addMaintenanceLog(
  assetId: string,
  serviceDate: string,
  description: string,
  technician: string,
  cost: number | null,
  partsReplaced: string,
  nextMaintenanceDays: number | null
) {
  const supabase = await createClient();

  const { error: logError } = await supabase
    .from("maintenance_logs")
    .insert({
      asset_id: assetId,
      service_date: serviceDate,
      description,
      technician: technician || null,
      cost: cost || null,
      parts_replaced: partsReplaced || null,
    });

  if (logError) {
    return { error: logError.message };
  }

  if (nextMaintenanceDays) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + nextMaintenanceDays);
    const nextMaintenance = nextDate.toISOString().split("T")[0];

    const { error: updateError } = await supabase
      .from("assets")
      .update({
        last_maintenance: serviceDate,
        next_maintenance: nextMaintenance,
      })
      .eq("id", assetId);

    if (updateError) {
      return { error: updateError.message };
    }
  } else {
    const { error: updateError } = await supabase
      .from("assets")
      .update({ last_maintenance: serviceDate })
      .eq("id", assetId);

    if (updateError) {
      return { error: updateError.message };
    }
  }

  return { success: true };
}

const MAX_ATTACHMENTS = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export async function addAttachment(
  assetId: string,
  file: File,
  type: "image" | "document",
  name: string
) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("asset_attachments")
    .select("*", { count: "exact", head: true })
    .eq("asset_id", assetId);

  if (count && count >= MAX_ATTACHMENTS) {
    return { error: `Maximum of ${MAX_ATTACHMENTS} attachments allowed per asset` };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "File type not allowed. Allowed: JPEG, PNG, WebP, PDF" };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { error: "File size must be less than 10MB" };
  }

  const isFirst = !count || count === 0;
  const fileExt = file.name.split(".").pop();
  const filePath = `${assetId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("asset-attachments")
    .upload(filePath, file);

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from("asset-attachments")
    .getPublicUrl(filePath);

  const { error: insertError } = await supabase
    .from("asset_attachments")
    .insert({
      asset_id: assetId,
      type,
      name: name || file.name,
      url: urlData.publicUrl,
      is_primary: isFirst,
      sort_order: 0,
    });

  if (insertError) {
    await supabase.storage.from("asset-attachments").remove([filePath]);
    return { error: insertError.message };
  }

  return { success: true, isPrimary: isFirst };
}

export async function deleteAttachment(attachmentId: string) {
  const supabase = await createClient();

  const { data: attachment, error: fetchError } = await supabase
    .from("asset_attachments")
    .select("url, asset_id, is_primary, name")
    .eq("id", attachmentId)
    .single();

  if (fetchError) {
    return { error: fetchError.message };
  }

  const urlPath = attachment.url.split("/storage/v1/object/public/asset-attachments/")[1];
  if (urlPath) {
    await supabase.storage.from("asset-attachments").remove([urlPath]);
  }

  const wasPrimary = attachment.is_primary;

  const { error: deleteError } = await supabase
    .from("asset_attachments")
    .delete()
    .eq("id", attachmentId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (wasPrimary) {
    await supabase
      .from("asset_attachments")
      .update({ is_primary: true })
      .eq("asset_id", attachment.asset_id)
      .order("created_at")
      .limit(1);
  }

  return { success: true };
}

export async function setPrimaryAttachment(attachmentId: string) {
  const supabase = await createClient();

  const { data: attachment, error: fetchError } = await supabase
    .from("asset_attachments")
    .select("asset_id, is_primary")
    .eq("id", attachmentId)
    .single();

  if (fetchError) {
    return { error: fetchError.message };
  }

  if (attachment.is_primary) {
  return { success: true };
}

  await supabase
    .from("asset_attachments")
    .update({ is_primary: false })
    .eq("asset_id", attachment.asset_id);

  const { error: updateError } = await supabase
    .from("asset_attachments")
    .update({ is_primary: true })
    .eq("id", attachmentId);

  if (updateError) {
    return { error: updateError.message };
  }

  return { success: true };
}

export async function addAttachmentLink(
  assetId: string,
  url: string,
  name: string
) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("asset_attachments")
    .select("*", { count: "exact", head: true })
    .eq("asset_id", assetId);

  if (count && count >= MAX_ATTACHMENTS) {
    return { error: `Maximum of ${MAX_ATTACHMENTS} attachments allowed per asset` };
  }

  const isFirst = !count || count === 0;

  const { error } = await supabase
    .from("asset_attachments")
    .insert({
      asset_id: assetId,
      type: "link",
      name: name || url,
      url,
      is_primary: isFirst,
      sort_order: 0,
    });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}