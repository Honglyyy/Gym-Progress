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

  async function updateSet(id: number, weight: number, reps: number, exerciseId: number, workoutSessionId: number) {
    const response = await workoutService.updateWorkoutSet(id, {
      weight: weight.toString(),
      reps: reps.toString(),
      exerciseId,
      workoutSessionId,
    });
    if (currentSession.value && currentSession.value.id === workoutSessionId) {
      currentSession.value.workoutSets = currentSession.value.workoutSets.map(s => s.id === id ? response.data : s);
    }
    sessions.value = sessions.value.map(session => {
      if (session.id === workoutSessionId) {
        return {
          ...session,
          workoutSets: session.workoutSets.map(s => s.id === id ? response.data : s)
        };
      }
      return session;
    });
  }

  async function deleteSet(id: number, workoutSessionId: number) {
    await workoutService.deleteWorkoutSet(id);
    if (currentSession.value && currentSession.value.id === workoutSessionId) {
      currentSession.value.workoutSets = currentSession.value.workoutSets.filter(s => s.id !== id);
    }
    sessions.value = sessions.value.map(session => {
      if (session.id === workoutSessionId) {
        return {
          ...session,
          workoutSets: session.workoutSets.filter(s => s.id !== id)
        };
      }
      return session;
    });
  }

  async function updateWorkoutSession(id: number, splitId: number, sessionName: string, sessionDate: string) {
    const response = await workoutService.updateWorkoutSession(id, splitId, sessionName, sessionDate);
    if (currentSession.value && currentSession.value.id === id) {
      currentSession.value = { ...currentSession.value, ...response.data };
    }
    sessions.value = sessions.value.map(s => s.id === id ? { ...s, ...response.data } : s);
  }

  async function deleteWorkoutSession(id: number) {
    await workoutService.deleteWorkoutSession(id);
    if (currentSession.value && currentSession.value.id === id) {
      currentSession.value = null;
    }
    sessions.value = sessions.value.filter(s => s.id !== id);
  }

  return { 
    sessions, currentSession, loading, 
    fetchSessions, startSession, addSet, 
    updateSet, deleteSet, updateWorkoutSession, deleteWorkoutSession 
  };
});
