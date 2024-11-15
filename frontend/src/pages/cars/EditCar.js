import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaChevronLeft, FaSpinner } from 'react-icons/fa';
import CarForm from '../../components/cars/CarForm';
import useCarStore from '../../store/carStore';

const EditCar = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentCar, fetchCar, updateCar, loading, error, clearError } = useCarStore();

  useEffect(() => {
    fetchCar(id);
    return () => clearError();
  }, [fetchCar, id, clearError]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await updateCar(id, values);
      toast.success('Car updated successfully');
      navigate('/cars');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Failed to update car';
      toast.error(errorMessage);
      setSubmitting(false);
    }
  };

  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    return error?.message || 'An error occurred';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 flex justify-between items-center">
          {getErrorMessage(error)}
          <button onClick={clearError} className="text-sm">✕</button>
        </div>
        <Link
          to="/cars"
          className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
        >
          <FaChevronLeft /> Back to Cars
        </Link>
      </div>
    );
  }

  if (!currentCar) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">Car not found</div>
        <Link
          to="/cars"
          className="text-blue-500 hover:text-blue-600 flex items-center gap-2 justify-center"
        >
          <FaChevronLeft /> Back to Cars
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/cars"
          className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
        >
          <FaChevronLeft /> Back to Cars
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Edit Car</h1>
      
      <CarForm
        initialValues={{
          title: currentCar.title,
          description: currentCar.description,
          tags: currentCar.tags,
          images: currentCar.images,
        }}
        onSubmit={handleSubmit}
        isEditing={true}
      />
    </div>
  );
};

export default EditCar; 