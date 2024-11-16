import { Formik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { cars } from '../utils/api';
import { uploadImage } from '../utils/api';
import CarForm from '../components/CarForm';

const carSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  tags: Yup.array().of(Yup.string().required('Tag cannot be empty')).min(1, 'At least one tag is required'),
  images: Yup.array()
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed')
});

export default function CarCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: cars.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['cars']);
      navigate('/');
    }
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      if (!values.imageFiles?.length) {
        setFieldError('images', 'At least one image is required');
        return;
      }

      const uploadPromises = values.imageFiles.map(file => 
        uploadImage(file).catch(error => {
          console.error('Error uploading image:', error);
          throw new Error('Failed to upload image');
        })
      );

      const imageUrls = await Promise.all(uploadPromises);
      
      await mutation.mutateAsync({
        title: values.title,
        description: values.description,
        tags: values.tags.filter(tag => tag.trim() !== ''),
        images: imageUrls
      });
    } catch (error) {
      console.error('Error creating car:', error);
      setFieldError('title', 'Failed to create car. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Car</h1>
        <p className="mt-2 text-gray-600">Fill in the details below to add a new car to your collection.</p>
      </div>
      
      <Formik
        initialValues={{
          title: '',
          description: '',
          tags: [''],
          imageFiles: [],
          images: []
        }}
        validationSchema={carSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, setFieldValue, values, isSubmitting }) => (
          <CarForm
            errors={errors}
            touched={touched}
            setFieldValue={setFieldValue}
            values={values}
            isSubmitting={isSubmitting || mutation.isPending}
            submitText="Create Car"
          />
        )}
      </Formik>
    </div>
  );
} 