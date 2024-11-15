import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useCarStore from '../../store/carStore';
import CarCard from '../../components/cars/CarCard';
import { FaPlus, FaSearch, FaSpinner, FaSort } from 'react-icons/fa';

const CARS_PER_PAGE = 6;

const CarsList = () => {
  const { cars, loading, error, fetchCars, deleteCar, searchCars, clearError } = useCarStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterTags, setFilterTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  useEffect(() => {
    // Extract unique tags from all cars
    const tags = new Set();
    cars.forEach(car => car.tags.forEach(tag => tags.add(tag)));
    setAvailableTags(Array.from(tags));
  }, [cars]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      if (!searchQuery.trim()) {
        // If search is empty, fetch all cars
        await fetchCars();
      } else {
        await searchCars(searchQuery);
      }
      setCurrentPage(1);
    } catch (error) {
      toast.error('Search failed. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await deleteCar(id);
        toast.success('Car deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete car');
      }
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleTagFilter = (tag) => {
    setFilterTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setCurrentPage(1);
  };

  // Filter and sort cars
  const filteredAndSortedCars = cars
    .filter(car => 
      filterTags.length === 0 || 
      filterTags.every(tag => car.tags.includes(tag))
    )
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'title') {
        return order * a.title.localeCompare(b.title);
      }
      return order * (new Date(a[sortBy]) - new Date(b[sortBy]));
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedCars.length / CARS_PER_PAGE);
  const startIndex = (currentPage - 1) * CARS_PER_PAGE;
  const endIndex = startIndex + CARS_PER_PAGE;
  const currentCars = filteredAndSortedCars.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add error message extraction helper
  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'An error occurred';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Cars</h1>
        <Link
          to="/cars/create"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600"
        >
          <FaPlus />
          <span>Add New Car</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 flex justify-between items-center">
          {getErrorMessage(error)}
          <button onClick={clearError} className="text-sm">✕</button>
        </div>
      )}

      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cars..."
              className="w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
            type="submit"
            className="bg-gray-100 px-6 py-2 rounded-lg hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Search
          </button>
        </form>

        <div className="flex gap-4">
          <button
            onClick={() => handleSort('title')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              sortBy === 'title' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
            }`}
          >
            Title
            {sortBy === 'title' && (
              <FaSort className={`transform ${sortOrder === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
            )}
          </button>
          <button
            onClick={() => handleSort('createdAt')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              sortBy === 'createdAt' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
            }`}
          >
            Date
            {sortBy === 'createdAt' && (
              <FaSort className={`transform ${sortOrder === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTagFilter(tag)}
              className={`px-3 py-1 rounded-full text-sm ${
                filterTags.includes(tag)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCars.map((car) => (
              <CarCard
                key={car._id}
                car={car}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {filteredAndSortedCars.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              No cars found. {cars.length === 0 ? 'Add your first car!' : 'Try adjusting your filters.'}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => goToPage(index + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === index + 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CarsList; 