import api from './axios';
import type { WorkoutSession, WorkoutSet, WorkoutSetRequest } from '../types';

export const workoutService = {
  getWorkoutSessions() {
    return api.get<WorkoutSession[]>('/workout-sessions');
  },
  addWorkoutSession(splitId: number, sessionName: string, sessionDate: string) {
    return api.post<WorkoutSession>('/workout-sessions', { splitId, sessionName, sessionDate });
  },
  updateWorkoutSession(id: number, splitId: number, sessionName: string, sessionDate: string) {
    return api.put<WorkoutSession>(`/workout-sessions/${id}`, { splitId, sessionName, sessionDate });
  },
  deleteWorkoutSession(id: number) {
    return api.delete(`/workout-sessions/${id}`);
  },
  addWorkoutSet(workoutSet: WorkoutSetRequest) {
    return api.post<WorkoutSet>('/exercises/sets', workoutSet);
  },
};
