import api from './axios';
import type { UserWithWeight, User} from '../types';

export interface Weight {
  id: number;
  weightBefore: number;
  weightAfter: number;
  createdAt: string;
}

export const userService = {
  getUsers() {
    return api.get<User[]>('/users');
  },
  getUser(id: number) {
    return api.get<UserWithWeight>(`/users/${id}`);
  },
  addUser(user: Omit<User, 'id'>) {
    return api.post<User>('/users', user);
  },
  updateUser(id: number, user: Omit<User, 'id'>) {
    return api.put<User>(`/users/${id}`, user);
  },
  deleteUser(id: number) {
    return api.delete(`/users/${id}`);
  },
  getWeightHistory(userId: number) {
    return api.get<Weight[]>(`/users/${userId}/weights`);
  },
  updateWeight(data: { userId: number; weightBefore: number; weightAfter: number }) {
    return api.post<UserWithWeight>('/users/weights', data);
  },
};
