import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { FaUserPlus } from 'react-icons/fa';

const signupSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { confirmPassword, ...signupData } = values;
      await signup(signupData);
      toast.success('Signup successful!');
      navigate('/cars');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Signup failed';
      toast.error(errorMessage);
      setSubmitting(false);
    }
  };

  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    return error?.message || 'An error occurred';
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
          {getErrorMessage(error)}
          <button 
            onClick={clearError}
            className="float-right text-sm"
          >
            ✕
          </button>
        </div>
      )}
      <Formik
        initialValues={{ 
          name: '', 
          email: '', 
          password: '', 
          confirmPassword: '' 
        }}
        validationSchema={signupSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              {touched.name && errors.name && (
                <div className="text-red-500 text-sm mt-1">{errors.name}</div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              {touched.email && errors.email && (
                <div className="text-red-500 text-sm mt-1">{errors.email}</div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              {touched.password && errors.password && (
                <div className="text-red-500 text-sm mt-1">{errors.password}</div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <div className="text-red-500 text-sm mt-1">{errors.confirmPassword}</div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center gap-2"
            >
              <FaUserPlus />
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>

            <div className="text-center text-gray-600 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-500 hover:text-blue-600">
                Login
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Signup; 