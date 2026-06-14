import api from './axios';
import type { MuscleGroupOption } from '../types';

export const muscleGroupService = {
  getMuscleGroups() {
    return api.get<MuscleGroupOption[]>('/muscle-groups');
  },
};
