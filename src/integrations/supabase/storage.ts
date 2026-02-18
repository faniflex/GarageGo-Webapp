import { supabase } from "./client";

// Upload an image file to Supabase Storage and return its public URL.
// Assumes a bucket named 'images' exists. Adjust `bucket` if needed.
export async function uploadImage(file: File, folder = "uploads", bucket = "images") {
  const ext = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export default uploadImage;
