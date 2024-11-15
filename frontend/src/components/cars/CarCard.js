import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';

const CarCard = ({ car, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:-translate-y-1">
      <div className="relative h-48 group">
        <img
          src={car.images[0] || '/placeholder-car.jpg'}
          alt={car.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 line-clamp-1">{car.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{car.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {car.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <Link
            to={`/cars/${car._id}`}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            View Details
          </Link>
          
          <div className="flex space-x-2">
            <Link
              to={`/cars/${car._id}/edit`}
              className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Edit"
            >
              <FaEdit />
            </Link>
            <button
              onClick={() => onDelete(car._id)}
              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard; 