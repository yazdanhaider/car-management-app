import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/common/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import CarsList from './pages/cars/CarsList';
import CreateCar from './pages/cars/CreateCar';
import CarDetail from './pages/cars/CarDetail';
import EditCar from './pages/cars/EditCar';
import PrivateRoute from './components/common/PrivateRoute';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="cars" element={<PrivateRoute><CarsList /></PrivateRoute>} />
          <Route path="cars/create" element={<PrivateRoute><CreateCar /></PrivateRoute>} />
          <Route path="cars/:id" element={<PrivateRoute><CarDetail /></PrivateRoute>} />
          <Route path="cars/:id/edit" element={<PrivateRoute><EditCar /></PrivateRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
