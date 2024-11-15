import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaSpinner } from 'react-icons/fa';
import useCarStore from '../../store/carStore';

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCar, fetchCar, deleteCar, loading, error, clearError } = useCarStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchCar(id);
    return () => clearError();
  }, [fetchCar, id, clearError]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await deleteCar(id);
        toast.success('Car deleted successfully');
        navigate('/cars');
      } catch (error) {
        const errorMessage = error.response?.data?.error || 
                           error.message || 
                           'Failed to delete car';
        toast.error(errorMessage);
      }
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === currentCar.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? currentCar.images.length - 1 : prev - 1
    );
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
      <div className="max-w-4xl mx-auto px-4 py-8">
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/cars"
          className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
        >
          <FaChevronLeft /> Back to Cars
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-96">
          <img
            src={currentCar.images[currentImageIndex]}
            alt={currentCar.title}
            className="w-full h-full object-cover"
          />
          {currentCar.images.length > 1 && (
            <>
              <button
                onClick={previousImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              >
                <FaChevronRight />
              </button>
            </>
          )}
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{currentCar.title}</h1>
            <div className="flex gap-2">
              <Link
                to={`/cars/${id}/edit`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                <FaEdit className="inline mr-2" /> Edit
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                <FaTrash className="inline mr-2" /> Delete
              </button>
            </div>
          </div>

          <p className="text-gray-600 mb-6">{currentCar.description}</p>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {currentCar.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">All Images</h2>
            <div className="grid grid-cols-4 gap-4">
              {currentCar.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Car ${index + 1}`}
                  className={`w-full h-24 object-cover rounded cursor-pointer ${
                    index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail; 