import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import CarForm from '../../components/cars/CarForm';
import useCarStore from '../../store/carStore';

const CreateCar = () => {
  const navigate = useNavigate();
  const { createCar, error, clearError } = useCarStore();

  const initialValues = {
    title: '',
    description: '',
    tags: [],
    images: [],
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await createCar(values);
      toast.success('Car created successfully');
      navigate('/cars');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Failed to create car';
      toast.error(errorMessage);
      setSubmitting(false);
    }
  };

  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    return error?.message || 'An error occurred';
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Car</h1>
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 flex justify-between items-center">
          {getErrorMessage(error)}
          <button onClick={clearError} className="text-sm">✕</button>
        </div>
      )}
      <CarForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CreateCar; 