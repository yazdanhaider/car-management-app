import { Formik, Form, Field, FieldArray } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';
import { FaPlus, FaTimes, FaSpinner } from 'react-icons/fa';
import { uploadImage } from '../../services/supabase';
import toast from 'react-hot-toast';

const carSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
  tags: Yup.array()
    .of(Yup.string().required('Tag cannot be empty'))
    .min(1, 'At least one tag is required'),
  images: Yup.array()
    .of(Yup.string().url('Invalid image URL'))
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
});

const CarForm = ({ initialValues, onSubmit, isEditing = false }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleImageUpload = async (e, setFieldValue, currentImages) => {
    const files = Array.from(e.target.files);
    
    if (files.length + currentImages.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      console.log('Starting upload process for files:', files.length);

      const uploadPromises = files.map(async file => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Each file must be less than 5MB');
        }
        if (!file.type.startsWith('image/')) {
          throw new Error('Only image files are allowed');
        }
        const url = await uploadImage(file, `cars/${Date.now()}-${file.name}`);
        console.log('Uploaded image URL:', url);
        return url;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      console.log('All uploaded URLs:', uploadedUrls);

      // Update form values with new images
      const newImages = [...currentImages, ...uploadedUrls];
      console.log('Updated images array:', newImages);
      setFieldValue('images', newImages);
      
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
      toast.error(error.message || 'Error uploading images');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={carSchema}
      onSubmit={onSubmit}
    >
      {({ values, errors, touched, setFieldValue, isSubmitting }) => (
        <Form className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Title</label>
            <Field
              name="title"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter car title"
              disabled={isSubmitting || uploading}
            />
            {touched.title && errors.title && (
              <div className="text-red-500 text-sm mt-1">{errors.title}</div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <Field
              as="textarea"
              name="description"
              className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter car description"
              disabled={isSubmitting || uploading}
            />
            {touched.description && errors.description && (
              <div className="text-red-500 text-sm mt-1">{errors.description}</div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Tags</label>
            <FieldArray name="tags">
              {({ push, remove }) => (
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {values.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-100 px-3 py-1 rounded"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                          disabled={isSubmitting || uploading}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add a tag"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isSubmitting && !uploading) {
                          e.preventDefault();
                          const value = e.target.value.trim();
                          if (value) {
                            push(value);
                            e.target.value = '';
                          }
                        }
                      }}
                      disabled={isSubmitting || uploading}
                    />
                    <button
                      type="button"
                      className="bg-gray-100 p-2 rounded hover:bg-gray-200 disabled:bg-gray-50"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add a tag"]');
                        const value = input.value.trim();
                        if (value) {
                          push(value);
                          input.value = '';
                        }
                      }}
                      disabled={isSubmitting || uploading}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  {touched.tags && errors.tags && (
                    <div className="text-red-500 text-sm mt-1">{errors.tags}</div>
                  )}
                </div>
              )}
            </FieldArray>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Images</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {values.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Car ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      console.error('Image load error:', image);
                      e.target.src = '/placeholder-car.jpg'; // Fallback image
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Removing image:', image);
                        const newImages = values.images.filter((_, i) => i !== index);
                        setFieldValue('images', newImages);
                      }}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setFieldValue, values.images)}
                className="hidden"
                id="image-upload"
                disabled={uploading || values.images.length >= 10 || isSubmitting}
              />
              <label
                htmlFor="image-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded cursor-pointer
                  ${uploading || values.images.length >= 10 || isSubmitting
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
              >
                {uploading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Images'
                )}
              </label>
              {uploadError && (
                <div className="text-red-500 text-sm">{uploadError}</div>
              )}
              {touched.images && errors.images && (
                <div className="text-red-500 text-sm">{errors.images}</div>
              )}
              <div className="text-sm text-gray-500">
                Maximum 10 images, each less than 5MB
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{isEditing ? 'Update Car' : 'Create Car'}</>
            )}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default CarForm; 