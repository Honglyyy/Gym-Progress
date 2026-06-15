import { defineStore } from 'pinia';
import { ref } from 'vue';
import { exerciseService } from '../api/exerciseService';
import type { Exercise, MuscleGroup } from '../types';

export const useExerciseStore = defineStore('exercise', () => {
  const exercises = ref<Exercise[]>([]);
  const loading = ref(false);

  async function fetchExercises(muscleGroup?: MuscleGroup) {
    loading.value = true;
    try {
      const response = await exerciseService.getExercises(muscleGroup);
      exercises.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function addExercise(exerciseName: string, muscleGroupId?: number) {
    const response = await exerciseService.createExercise(exerciseName, muscleGroupId);
    exercises.value.push(response.data);
    return response.data;
  }

  async function updateExercise(id: number, exerciseName: string, muscleGroupId?: number) {
    const response = await exerciseService.updateExercise(id, exerciseName, muscleGroupId);
    const index = exercises.value.findIndex(e => e.id === id);
    if (index !== -1) {
      exercises.value[index] = response.data;
    }
  }

  async function deleteExercise(id: number) {
    await exerciseService.deleteExercise(id);
    exercises.value = exercises.value.filter(e => e.id !== id);
  }

  return { exercises, loading, fetchExercises, addExercise, updateExercise, deleteExercise };
});
