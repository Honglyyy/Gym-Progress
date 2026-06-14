import api from './axios';
import type { Exercise, MuscleGroup } from '../types';

export const exerciseService = {
  getExercises(muscleGroup?: MuscleGroup) {
    return api.get<Exercise[]>('/exercises', { params: { muscleGroup } });
  },
  getExerciseHistory(id: number) {
    return api.get<Exercise>(`/exercises/${id}/history`);
  },
  createExercise(exerciseName: string, muscleGroupId?: number) {
    return api.post<Exercise>('/exercises', { exerciseName, muscleGroupId });
  },
  deleteExercise(id: number) {
    return api.delete(`/exercises/${id}`);
  },
};
