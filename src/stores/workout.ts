import { defineStore } from 'pinia';
import { ref } from 'vue';
import { workoutService } from '../api/workoutService';
import type { WorkoutSession } from '../types';

export const useWorkoutStore = defineStore('workout', () => {
  const sessions = ref<WorkoutSession[]>([]);
  const currentSession = ref<WorkoutSession | null>(null);
  const loading = ref(false);

  async function fetchSessions() {
    loading.value = true;
    try {
      const response = await workoutService.getWorkoutSessions();
      sessions.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function startSession(splitId: number, sessionName: string, sessionDate: string) {
    const response = await workoutService.addWorkoutSession(splitId, sessionName, sessionDate);
    currentSession.value = response.data;
    sessions.value = [response.data, ...sessions.value];
    return response.data;
  }

  async function addSet(weight: number, reps: number, exerciseId: number) {
    if (!currentSession.value) return;
    const response = await workoutService.addWorkoutSet({
      weight: weight.toString(),
      reps: reps.toString(),
      exerciseId,
      workoutSessionId: currentSession.value.id,
    });
    currentSession.value = {
      ...currentSession.value,
      workoutSets: [...currentSession.value.workoutSets, response.data],
    };
    sessions.value = sessions.value.map(session =>
      session.id === currentSession.value?.id ? currentSession.value : session
    );
    return response.data;
  }

  return { sessions, currentSession, loading, fetchSessions, startSession, addSet };
});
