import { create } from 'zustand';
import { carAPI } from '../services/api';

const formatError = (error) => {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

const useCarStore = create((set, get) => ({
  cars: [],
  currentCar: null,
  loading: false,
  error: null,
  
  fetchCars: async () => {
    set({ loading: true, error: null });
    try {
      const response = await carAPI.getAllCars();
      set({ cars: response.data, loading: false });
    } catch (error) {
      console.error('Fetch cars error:', error);
      set({ 
        error: formatError(error),
        loading: false 
      });
      throw error;
    }
  },

  fetchCar: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await carAPI.getCar(id);
      set({ currentCar: response.data, loading: false });
      return response.data;
    } catch (error) {
      console.error('Fetch car error:', error);
      set({ 
        error: formatError(error),
        loading: false 
      });
      throw error;
    }
  },

  createCar: async (carData) => {
    set({ loading: true, error: null });
    try {
      const response = await carAPI.createCar(carData);
      set(state => ({ 
        cars: [...state.cars, response.data],
        loading: false 
      }));
      return response.data;
    } catch (error) {
      console.error('Create car error:', error);
      set({ 
        error: formatError(error),
        loading: false 
      });
      throw error;
    }
  },

  updateCar: async (id, carData) => {
    set({ loading: true, error: null });
    try {
      const response = await carAPI.updateCar(id, carData);
      set(state => ({
        cars: state.cars.map(car => 
          car._id === id ? response.data : car
        ),
        currentCar: response.data,
        loading: false
      }));
      return response.data;
    } catch (error) {
      console.error('Update car error:', error);
      set({ 
        error: formatError(error),
        loading: false 
      });
      throw error;
    }
  },

  deleteCar: async (id) => {
    set({ loading: true, error: null });
    try {
      await carAPI.deleteCar(id);
      set(state => ({
        cars: state.cars.filter(car => car._id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Delete car error:', error);
      set({ 
        error: formatError(error),
        loading: false 
      });
      throw error;
    }
  },

  searchCars: async (query) => {
    set({ loading: true, error: null });
    try {
      if (!query.trim()) {
        const response = await carAPI.getAllCars();
        set({ cars: response.data, loading: false });
        return response.data;
      }
      const response = await carAPI.searchCars(query);
      set({ cars: response.data, loading: false });
      return response.data;
    } catch (error) {
      console.error('Search cars error:', error);
      set({ 
        error: formatError(error),
        loading: false 
      });
      throw error;
    }
  },

  clearCurrentCar: () => set({ currentCar: null }),
  clearError: () => set({ error: null }),
}));

export default useCarStore; 