import api from './axios';
import type { Split } from '../types';

export const splitService = {
  getSplits() {
    return api.get<Split[]>('/splits');
  },
  addSplit(splitName: string, sessions: { sessionName: string, exerciseIds: number[] }[]) {
    return api.post<Split>('/splits', { splitName, sessions });
  },
  updateSplit(id: number, splitName: string, sessions: { sessionName: string, exerciseIds: number[] }[]) {
    return api.put<Split>(`/splits/${id}`, { splitName, sessions });
  },
  deleteSplit(id: number) {
    return api.delete(`/splits/${id}`);
  },
};
