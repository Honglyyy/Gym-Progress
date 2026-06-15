import { defineStore } from 'pinia';
import { ref } from 'vue';
import { workoutService } from '../api/workoutService';
import type { WorkoutSession, WorkoutSet } from '../types';

export const useWorkoutStore = defineStore('workout', () => {
  const sessions = ref<WorkoutSession[]>([]);
  const currentSession = ref<WorkoutSession | null>(null);
  const loading = ref(false);
  const isDraft = ref(false);

  async function fetchSessions() {
    loading.value = true;
    try {
      const response = await workoutService.getWorkoutSessions();
      sessions.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function startSession(splitId: number, sessionName: string, sessionDate: string, exercises: any[] = []) {
    isDraft.value = true;
    currentSession.value = {
      id: 0, // 0 indicates draft
      splitId,
      sessionName,
      sessionDate,
      exercises,
      workoutSets: []
    };
  }

  async function saveSession() {
    if (!currentSession.value || !isDraft.value) return;
    
    loading.value = true;
    try {
      // 1. Create the session
      const sessionResponse = await workoutService.addWorkoutSession(
        currentSession.value.splitId,
        currentSession.value.sessionName,
        currentSession.value.sessionDate
      );
      
      const newSessionId = sessionResponse.data.id;

      // 2. Create all sets
      for (const set of currentSession.value.workoutSets) {
        await workoutService.addWorkoutSet({
          weight: set.weight,
          reps: set.reps,
          exerciseId: set.exerciseId,
          workoutSessionId: newSessionId
        });
      }

      // 3. Refresh sessions and clear draft
      await fetchSessions();
      currentSession.value = null;
      isDraft.value = false;
    } finally {
      loading.value = false;
    }
  }

  async function addSet(weight: number, reps: number, exerciseId: number, sessionId?: number) {
    const targetSessionId = sessionId || currentSession.value?.id;
    if (!targetSessionId && !isDraft.value) return;

    if (isDraft.value && !sessionId) {
      const newSet: WorkoutSet = {
        id: Date.now(), // Temp ID
        exerciseId,
        exerciseName: currentSession.value?.exercises.find(e => e.id === exerciseId)?.exerciseName || '',
        workoutSessionId: 0,
        reps: reps.toString(),
        weight: weight.toString()
      };
      currentSession.value?.workoutSets.push(newSet);
      return newSet;
    } else {
      const response = await workoutService.addWorkoutSet({
        weight: weight.toString(),
        reps: reps.toString(),
        exerciseId,
        workoutSessionId: targetSessionId!,
      });
      
      // Update local state
      if (currentSession.value && currentSession.value.id === targetSessionId) {
        currentSession.value.workoutSets.push(response.data);
      }
      sessions.value = sessions.value.map(session =>
        session.id === targetSessionId 
          ? { ...session, workoutSets: [...session.workoutSets, response.data] } 
          : session
      );
      return response.data;
    }
  }

  async function updateSet(id: number, weight: number, reps: number, exerciseId: number, workoutSessionId: number) {
    if (workoutSessionId === 0 && currentSession.value) {
      currentSession.value.workoutSets = currentSession.value.workoutSets.map(s => 
        s.id === id ? { ...s, weight: weight.toString(), reps: reps.toString(), exerciseId } : s
      );
      return;
    }

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
    if (workoutSessionId === 0 && currentSession.value) {
      currentSession.value.workoutSets = currentSession.value.workoutSets.filter(s => s.id !== id);
      return;
    }

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
    if (id === 0 && currentSession.value) {
      currentSession.value.sessionName = sessionName;
      currentSession.value.sessionDate = sessionDate;
      return;
    }

    const response = await workoutService.updateWorkoutSession(id, splitId, sessionName, sessionDate);
    if (currentSession.value && currentSession.value.id === id) {
      currentSession.value = { ...currentSession.value, ...response.data };
    }
    sessions.value = sessions.value.map(s => s.id === id ? { ...s, ...response.data } : s);
  }

  async function deleteWorkoutSession(id: number) {
    if (id === 0) {
      currentSession.value = null;
      isDraft.value = false;
      return;
    }

    await workoutService.deleteWorkoutSession(id);
    if (currentSession.value && currentSession.value.id === id) {
      currentSession.value = null;
    }
    sessions.value = sessions.value.filter(s => s.id !== id);
  }

  return { 
    sessions, currentSession, loading, isDraft,
    fetchSessions, startSession, saveSession, addSet, 
    updateSet, deleteSet, updateWorkoutSession, deleteWorkoutSession 
  };
});
