import axios from 'axios';

const api = axios.create({
  baseURL: 'https://my-gym-tracker-g0mu.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
