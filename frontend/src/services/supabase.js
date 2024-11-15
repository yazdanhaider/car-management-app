import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadImage = async (file, path) => {
  try {
    console.log('Starting image upload:', { fileName: file.name, path });

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('cars')
      .upload(filePath, file);

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cars')
      .getPublicUrl(filePath);

    console.log('Generated public URL:', publicUrl);

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
};

export const deleteImage = async (path) => {
  try {
    console.log('Attempting to delete image:', path);
    const { error } = await supabase.storage
      .from('cars')
      .remove([path]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteImage:', error);
    throw error;
  }
};

export default supabase; 