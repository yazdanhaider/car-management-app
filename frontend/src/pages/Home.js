import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { FaCar, FaUserPlus, FaSignInAlt } from 'react-icons/fa';

const Home = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to Car Management
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A simple and powerful platform to manage your car listings with ease.
          Upload images, add descriptions, and organize with tags.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <FaCar className="text-4xl text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Manage Cars</h3>
            <p className="text-gray-600">
              Create, edit, and organize your car listings in one place
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl text-blue-500 mx-auto mb-4">📸</div>
            <h3 className="text-xl font-semibold mb-2">Multiple Images</h3>
            <p className="text-gray-600">
              Upload up to 10 images for each car listing
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl text-blue-500 mx-auto mb-4">🏷️</div>
            <h3 className="text-xl font-semibold mb-2">Smart Tagging</h3>
            <p className="text-gray-600">
              Organize cars with custom tags for easy searching
            </p>
          </div>
        </div>

        <div className="space-x-4">
          {isAuthenticated ? (
            <Link
              to="/cars"
              className="inline-flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaCar className="mr-2" />
              View My Cars
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="inline-flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FaUserPlus className="mr-2" />
                Sign Up
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center bg-white text-blue-500 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-blue-500"
              >
                <FaSignInAlt className="mr-2" />
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 