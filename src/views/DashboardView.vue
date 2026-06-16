<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useUserStore } from '../stores/user';
import { useSplitStore } from '../stores/split';
import { useWorkoutStore } from '../stores/workout';
import type { WorkoutSession } from '../types';
import { exportToExcel, exportToPDF, filterSessions } from '../utils/exportUtils';

const userStore = useUserStore();
const splitStore = useSplitStore();
const workoutStore = useWorkoutStore();

const selectedExerciseId = ref<number | null>(null);
const selectedSplitId = ref<number | null>(null);
const selectedSession = ref<any | null>(null);
const weight = ref<number | null>(null);
const reps = ref<number | null>(null);
const sessionDate = ref(new Date().toISOString().slice(0, 10));
const expandedSessionIds = ref<number[]>([]);

const filterPeriod = ref<'day' | 'week' | 'month' | 'year' | 'all'>('all');
const filterSessionName = ref('');

const filteredSessions = computed(() => {
  let result = filterSessions(workoutStore.sessions, filterPeriod.value);
  if (filterSessionName.value) {
    result = result.filter(s => s.sessionName.toLowerCase().includes(filterSessionName.value.toLowerCase()));
  }
  return result;
});

const handleExportExcel = () => {
  exportToExcel(filteredSessions.value, `workout_history_${filterPeriod.value}.xlsx`);
};

const handleExportPDF = () => {
  exportToPDF(filteredSessions.value, `workout_history_${filterPeriod.value}.pdf`);
};

const editingSetId = ref<number | null>(null);
const editingWeight = ref<number | null>(null);
const editingReps = ref<number | null>(null);
const editingExerciseId = ref<number | null>(null);

const editingSessionId = ref<number | null>(null);
const editingSessionName = ref('');
const editingSessionDate = ref('');

const addingSetToExercise = ref<{ sessionId: number; exerciseId: number } | null>(null);

onMounted(() => {
  userStore.fetchUsers();
  splitStore.fetchSplits();
  workoutStore.fetchSessions();
});

const activeSplitExercises = computed(() => {
  if (!workoutStore.currentSession) return [];
  return workoutStore.currentSession.exercises;
});

const selectedSplit = computed(() => {
  if (selectedSplitId.value === null) return null;
  return splitStore.splits.find(split => split.id === selectedSplitId.value) ?? null;
});

const selectSplit = (splitId: number) => {
  selectedSplitId.value = splitId;
  selectedSession.value = null;
};

const selectSession = (session: any) => {
  selectedSession.value = session;
};

const setsByExercise = (session: WorkoutSession) => {
  return session.exercises.map(exercise => ({
    exercise,
    sets: session.workoutSets.filter(set => set.exerciseId === exercise.id),
  }));
};

const toggleSession = (sessionId: number) => {
  expandedSessionIds.value = expandedSessionIds.value.includes(sessionId)
    ? expandedSessionIds.value.filter(id => id !== sessionId)
    : [...expandedSessionIds.value, sessionId];
};

const handleAddSet = async () => {
  if (selectedExerciseId.value && weight.value !== null && reps.value !== null) {
    await workoutStore.addSet(weight.value, reps.value, selectedExerciseId.value);
    weight.value = null;
    reps.value = null;
  }
};

const handleAddSetInline = async (sessionId: number, exerciseId: number) => {
  if (weight.value !== null && reps.value !== null) {
    await workoutStore.addSet(weight.value, reps.value, exerciseId, sessionId);
    weight.value = null;
    reps.value = null;
    addingSetToExercise.value = null;
  }
};

const startWorkout = async () => {
  if (selectedSplitId.value === null || !selectedSession.value) return;
  await workoutStore.startSession(
    selectedSplitId.value, 
    selectedSession.value.sessionName, 
    sessionDate.value,
    selectedSession.value.exercises
  );
};

const handleSaveSession = async () => {
  if (confirm('Are you sure you want to save this session to the database?')) {
    await workoutStore.saveSession();
  }
};

const quickAddSet = (sessionId: number, exerciseId: number) => {
  if (workoutStore.currentSession && sessionId === workoutStore.currentSession.id) {
    selectedExerciseId.value = exerciseId;
    weight.value = null;
    reps.value = null;
    const el = document.querySelector('.add-set-card');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  } else {
    addingSetToExercise.value = { sessionId, exerciseId };
    weight.value = null;
    reps.value = null;
  }
};

const handleEditSet = (set: any) => {
  editingSetId.value = set.id;
  editingWeight.value = parseFloat(set.weight);
  editingReps.value = parseInt(set.reps);
  editingExerciseId.value = set.exerciseId;
};

const handleEditSession = (session: WorkoutSession) => {
  editingSessionId.value = session.id;
  editingSessionName.value = session.sessionName;
  editingSessionDate.value = session.sessionDate;
};

const handleUpdateSession = async () => {
  if (editingSessionId.value && editingSessionName.value && editingSessionDate.value) {
    const session = workoutStore.sessions.find(s => s.id === editingSessionId.value);
    if (session) {
      await workoutStore.updateWorkoutSession(editingSessionId.value, session.splitId, editingSessionName.value, editingSessionDate.value);
      editingSessionId.value = null;
    }
  }
};

const cancelEditSession = () => {
  editingSessionId.value = null;
};

const handleUpdateSet = async (sessionId: number) => {
  if (editingSetId.value && editingWeight.value !== null && editingReps.value !== null && editingExerciseId.value !== null) {
    await workoutStore.updateSet(editingSetId.value, editingWeight.value, editingReps.value, editingExerciseId.value, sessionId);
    editingSetId.value = null;
    editingWeight.value = null;
    editingReps.value = null;
    editingExerciseId.value = null;
  }
};

const handleDeleteSet = async (setId: number, sessionId: number) => {
  if (confirm('Are you sure you want to delete this set?')) {
    await workoutStore.deleteSet(setId, sessionId);
  }
};

const handleDeleteSession = async (sessionId: number) => {
  if (confirm('Are you sure you want to delete this entire workout session?')) {
    await workoutStore.deleteWorkoutSession(sessionId);
  }
};

const cancelEditSet = () => {
  editingSetId.value = null;
  editingWeight.value = null;
  editingReps.value = null;
  editingExerciseId.value = null;
};
</script>

<template>
  <div class="dashboard" v-if="userStore.currentUser">
    <section class="page-heading">
      <div>
        <p class="eyebrow">Today</p>
        <h1>Gym Progress</h1>
      </div>
      <div class="user-summary">
        <span>{{ userStore.currentUser.username }}</span>
        <strong>{{ userStore.currentUser.weightAfter }} kg</strong>
      </div>
    </section>

    <div class="layout-grid">
      <section v-if="!workoutStore.currentSession" class="panel start-workout">
        <div class="section-title">
          <h2>Start Workout</h2>
        </div>

        <div class="workflow-steps">
          <!-- Step 1: Select Split -->
          <div class="step">
            <h3 class="step-label">1. Choose Split</h3>
            <div class="button-grid">
              <button
                v-for="split in splitStore.splits"
                :key="split.id"
                class="choice-btn"
                :class="{ active: selectedSplitId === split.id }"
                @click="selectSplit(split.id)"
              >
                {{ split.splitName }}
              </button>
            </div>
          </div>

          <!-- Step 2: Select Session -->
          <div class="step" v-if="selectedSplit">
            <h3 class="step-label">2. Select Session</h3>
            <div class="button-grid">
              <button
                v-for="session in selectedSplit.sessions"
                :key="session.id"
                class="choice-btn"
                :class="{ active: selectedSession?.id === session.id }"
                @click="selectSession(session)"
              >
                {{ session.sessionName }}
              </button>
            </div>
          </div>

          <!-- Step 3: Confirm and Start -->
          <div class="step" v-if="selectedSession">
            <h3 class="step-label">3. Confirm Details</h3>
            <div class="confirm-box">
              <div class="details">
                <p><strong>Split:</strong> {{ selectedSplit?.splitName }}</p>
                <p><strong>Session:</strong> {{ selectedSession.sessionName }}</p>
                <p><strong>Exercises:</strong> {{ selectedSession.exercises.length }}</p>
                <label class="date-input">
                  <span>Date:</span>
                  <input v-model="sessionDate" type="date" />
                </label>
              </div>
              <button class="primary-action start-btn" @click="startWorkout">
                Start {{ selectedSession.sessionName }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section v-else class="panel active-session">
        <div class="section-title">
          <div v-if="editingSessionId === workoutStore.currentSession.id" class="session-edit-header">
            <input v-model="editingSessionName" class="edit-session-name" />
            <input v-model="editingSessionDate" type="date" class="edit-session-date" />
            <div class="edit-actions">
              <button @click="handleUpdateSession" class="save-session">Save</button>
              <button @click="cancelEditSession" class="cancel-session">Cancel</button>
            </div>
          </div>
          <div v-else @click="handleEditSession(workoutStore.currentSession)">
            <p class="eyebrow">Active Session {{ workoutStore.isDraft ? '(Draft)' : '' }}</p>
            <h2 class="editable-title">{{ workoutStore.currentSession.sessionName }} ✎</h2>
          </div>
          <div class="session-meta">
            <button v-if="workoutStore.isDraft" class="save-btn-top" @click="handleSaveSession">Save Session</button>
            <span>{{ workoutStore.currentSession.sessionDate }}</span>
            <strong>{{ workoutStore.currentSession.workoutSets.length }} sets</strong>
          </div>
        </div>

        <div class="add-set-card">
          <h3>Log New Set</h3>
          <div class="form-grid">
            <div class="input-group full">
              <label>Exercise</label>
              <select v-model.number="selectedExerciseId">
                <option :value="null" disabled>Select exercise</option>
                <option v-for="ex in activeSplitExercises" :key="ex.id" :value="ex.id">
                  {{ ex.exerciseName }}
                </option>
              </select>
            </div>
            <div class="input-group">
              <label>Weight (kg)</label>
              <input v-model.number="weight" type="number" min="0" step="0.5" placeholder="0" />
            </div>
            <div class="input-group">
              <label>Reps</label>
              <input v-model.number="reps" type="number" min="1" step="1" placeholder="0" />
            </div>
            <button
              class="add-btn"
              @click="handleAddSet"
              :disabled="selectedExerciseId === null || weight === null || reps === null"
            >
              Add Set
            </button>
          </div>
        </div>

        <div class="exercise-log">
          <div v-for="entry in setsByExercise(workoutStore.currentSession)" :key="entry.exercise.id" class="exercise-row">
            <div class="exercise-info">
              <strong>{{ entry.exercise.exerciseName }}</strong>
              <div class="exercise-info-right">
                <button v-if="entry.sets.length === 0" class="quick-add-btn" @click="quickAddSet(workoutStore.currentSession!.id, entry.exercise.id)">+ Add Set</button>
                <span>{{ entry.exercise.muscleGroup || 'No group' }}</span>
              </div>
            </div>
            <div class="set-chips">
              <div v-if="addingSetToExercise?.sessionId === workoutStore.currentSession!.id && addingSetToExercise?.exerciseId === entry.exercise.id" class="set-edit-form inline-add">
                <input v-model.number="weight" type="number" step="0.5" placeholder="kg" />
                <span>x</span>
                <input v-model.number="reps" type="number" placeholder="reps" />
                <button @click="handleAddSetInline(workoutStore.currentSession!.id, entry.exercise.id)" class="save-set">✓</button>
                <button @click="addingSetToExercise = null" class="cancel-set">×</button>
              </div>
              <span v-else-if="entry.sets.length === 0" class="no-sets">No sets logged</span>
              <div v-for="(set, index) in entry.sets" :key="set.id" class="set-chip-container">
                <div v-if="editingSetId === set.id" class="set-edit-form expanded">
                  <select v-model="editingExerciseId" class="edit-set-exercise">
                    <option v-for="ex in activeSplitExercises" :key="ex.id" :value="ex.id">{{ ex.exerciseName }}</option>
                  </select>
                  <div class="edit-inputs">
                    <input v-model.number="editingWeight" type="number" step="0.5" />
                    <span>x</span>
                    <input v-model.number="editingReps" type="number" />
                    <button @click="handleUpdateSet(workoutStore.currentSession!.id)" class="save-set">✓</button>
                    <button @click="cancelEditSet" class="cancel-set">×</button>
                  </div>
                </div>
                <div v-else class="set-chip" @click="handleEditSet(set)">
                  <small>{{ index + 1 }}</small>
                  {{ set.weight }}<small>kg</small> x {{ set.reps }}
                  <button class="delete-set-btn" @click.stop="handleDeleteSet(set.id, workoutStore.currentSession!.id)">×</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="panel history">
        <div class="section-title">
          <h2>Recent History</h2>
          <div class="history-controls">
            <select v-model="filterPeriod" class="filter-select">
              <option value="all">All Time</option>
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <input v-model="filterSessionName" placeholder="Search session..." class="filter-input" />
            <div class="export-buttons">
              <button @click="handleExportExcel" title="Export to Excel" class="export-btn excel">Excel</button>
              <button @click="handleExportPDF" title="Export to PDF" class="export-btn pdf">PDF</button>
            </div>
          </div>
          <span>{{ filteredSessions.length }} sessions</span>
        </div>

        <div v-if="workoutStore.loading">Loading workouts...</div>
        <div v-else class="history-list">
          <article v-for="session in filteredSessions" :key="session.id" class="history-card">
            <div class="history-header">
              <div v-if="editingSessionId === session.id" class="session-edit-header history-edit">
                <input v-model="editingSessionName" />
                <input v-model="editingSessionDate" type="date" />
                <button @click="handleUpdateSession" class="save-set">✓</button>
                <button @click="cancelEditSession" class="cancel-set">×</button>
              </div>
              <button v-else class="history-toggle" @click="toggleSession(session.id)">
                <div class="history-main">
                  <strong>{{ session.sessionName }}</strong>
                  <small>{{ session.sessionDate }}</small>
                </div>
                <div class="history-stats">
                  <span>{{ session.workoutSets.length }} sets</span>
                  <span class="chevron" :class="{ open: expandedSessionIds.includes(session.id) }">▼</span>
                </div>
              </button>
              <div class="history-actions">
                <button v-if="editingSessionId !== session.id" class="edit-session-btn" @click="handleEditSession(session)">✎</button>
                <button class="delete-session-btn" @click="handleDeleteSession(session.id)">🗑</button>
              </div>
            </div>
            <div v-if="expandedSessionIds.includes(session.id)" class="history-detail">
              <div v-for="entry in setsByExercise(session)" :key="entry.exercise.id" class="exercise-row">
                <div class="exercise-info">
                  <strong>{{ entry.exercise.exerciseName }}</strong>
                  <div class="exercise-info-right">
                    <button v-if="entry.sets.length === 0" class="quick-add-btn" @click="quickAddSet(session.id, entry.exercise.id)">+ Add Set</button>
                    <span>{{ entry.exercise.muscleGroup || 'No group' }}</span>
                  </div>
                </div>
                <div class="set-chips">
                  <div v-if="addingSetToExercise?.sessionId === session.id && addingSetToExercise?.exerciseId === entry.exercise.id" class="set-edit-form inline-add">
                    <input v-model.number="weight" type="number" step="0.5" placeholder="kg" />
                    <span>x</span>
                    <input v-model.number="reps" type="number" placeholder="reps" />
                    <button @click="handleAddSetInline(session.id, entry.exercise.id)" class="save-set">✓</button>
                    <button @click="addingSetToExercise = null" class="cancel-set">×</button>
                  </div>
                  <span v-else-if="entry.sets.length === 0">No sets logged</span>
                  <div v-for="set in entry.sets" :key="set.id" class="set-chip-container">
                    <div v-if="editingSetId === set.id" class="set-edit-form expanded">
                      <select v-model="editingExerciseId" class="edit-set-exercise">
                        <option v-for="ex in session.exercises" :key="ex.id" :value="ex.id">{{ ex.exerciseName }}</option>
                      </select>
                      <div class="edit-inputs">
                        <input v-model.number="editingWeight" type="number" step="0.5" />
                        <span>x</span>
                        <input v-model.number="editingReps" type="number" />
                        <button @click="handleUpdateSet(session.id)" class="save-set">✓</button>
                        <button @click="cancelEditSet" class="cancel-set">×</button>
                      </div>
                    </div>
                    <div v-else class="set-chip" @click="handleEditSet(set)">
                      {{ set.weight }}kg x {{ set.reps }}
                      <button class="delete-set-btn" @click.stop="handleDeleteSet(set.id, session.id)">×</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
  <div v-else class="loading-state">Loading user data...</div>
</template>

<style scoped>
.history-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select, .filter-input {
  background: #0d1210;
  border: 1px solid #31433b;
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.filter-input {
  width: 120px;
}

.export-buttons {
  display: flex;
  gap: 0.25rem;
}

.export-btn {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}

.export-btn.excel {
  background: rgba(47, 177, 116, 0.1);
  color: #2fb174;
  border-color: #2fb174;
}

.export-btn.pdf {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-color: #e74c3c;
}

.save-btn-top {
  background: #2fb174;
  color: #08100c;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-weight: 800;
  font-size: 0.8rem;
  cursor: pointer;
  margin-bottom: 0.25rem;
}

.exercise-info-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-add-btn {
  background: rgba(47, 177, 116, 0.1);
  color: #2fb174;
  border: 1px dashed #2fb174;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.set-edit-form.expanded {
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
  width: 100%;
}

.edit-inputs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.edit-set-exercise {
  width: 100%;
  padding: 0.2rem;
  font-size: 0.8rem;
  background: #0d1210;
  border: 1px solid #31433b;
  color: white;
  border-radius: 4px;
}

.set-edit-form.inline-add {
  border-style: dashed;
  background: rgba(47, 177, 116, 0.05);
}

.set-edit-form.inline-add input {
  width: 60px;
}
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.page-heading h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  letter-spacing: -1px;
}

.eyebrow {
  margin: 0 0 0.25rem;
  color: #2fb174;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
}

.user-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0.75rem 1.25rem;
  border: 1px solid #31433b;
  border-radius: 12px;
  background: linear-gradient(145deg, #16221d, #0d1210);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.layout-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
  align-items: start;
}

.panel {
  padding: 1.5rem;
  border: 1px solid #31433b;
  border-radius: 16px;
  background: #121816;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-title h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

/* Workflow Steps */
.workflow-steps {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.step-label {
  font-size: 0.9rem;
  color: #9ba9a3;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
}

.choice-btn {
  padding: 1rem;
  border: 1px solid #31433b;
  border-radius: 12px;
  background: #0d1210;
  color: white;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
}

.choice-btn:hover {
  border-color: #2fb174;
  background: #16221d;
}

.choice-btn.active {
  background: #2fb174;
  color: #08100c;
  border-color: #2fb174;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(47, 177, 116, 0.3);
}

.confirm-box {
  background: #16221d;
  border: 1px solid #2fb174;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.confirm-box .details p {
  margin: 0.5rem 0;
}

.date-input {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.date-input input {
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #31433b;
  background: #0d1210;
  color: white;
}

.start-btn {
  margin-top: 0.5rem;
  padding: 1rem;
  font-size: 1.1rem;
}

/* Active Session */
.active-session .section-title {
  border-bottom: 1px solid #31433b;
  padding-bottom: 1rem;
}

.session-meta {
  text-align: right;
  display: flex;
  flex-direction: column;
}

.session-edit-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.session-edit-header input {
  padding: 0.4rem;
  font-size: 0.9rem;
  background: #0d1210;
  border: 1px solid #31433b;
  color: white;
  border-radius: 4px;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.save-session, .cancel-session {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
}

.save-session { background: #2fb174; color: #08100c; border: none; }
.cancel-session { background: #1a2420; color: #9ba9a3; border: 1px solid #31433b; }

.editable-title {
  cursor: pointer;
}

.editable-title:hover {
  color: #2fb174;
}

.history-edit {
  flex-direction: row;
  padding: 0.5rem;
  flex-grow: 1;
}

.history-edit input {
  flex-grow: 1;
}

.history-actions {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.edit-session-btn {
  background: none;
  border: none;
  color: #9ba9a3;
  cursor: pointer;
  padding: 0.5rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.edit-session-btn:hover {
  opacity: 1;
  color: #2fb174;
}

.add-set-card {
  background: #0d1210;
  border: 1px solid #26352f;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.add-set-card h3 {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: #2fb174;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.input-group.full {
  grid-column: span 2;
}

.input-group label {
  display: block;
  font-size: 0.8rem;
  color: #9ba9a3;
  margin-bottom: 0.4rem;
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #31433b;
  background: #121816;
  color: white;
  font-size: 1rem;
}

.add-btn {
  grid-column: span 2;
  background: #2fb174;
  color: #08100c;
  font-weight: 800;
  padding: 0.85rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.add-btn:disabled {
  background: #1e3129;
  color: #4a5c54;
}

.exercise-log {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.exercise-row {
  padding: 1rem;
  border: 1px solid #26352f;
  border-radius: 12px;
  background: #0d1210;
}

.exercise-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.75rem;
}

.exercise-info span {
  font-size: 0.8rem;
  color: #2fb174;
  background: rgba(47, 177, 116, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.set-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.set-chip-container {
  display: flex;
  align-items: center;
}

.set-edit-form {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #1e3129;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  border: 1px solid #2fb174;
}

.set-edit-form input {
  width: 45px;
  padding: 0.2rem;
  font-size: 0.85rem;
  background: #0d1210;
  text-align: center;
}

.save-set, .cancel-set {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
  padding: 0.2rem;
}

.save-set { color: #2fb174; }
.cancel-set { color: #ff4444; }

.set-chip {
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  background: #1e3129;
  color: #c7f0dd;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  position: relative;
  padding-right: 1.5rem;
}

.delete-set-btn {
  position: absolute;
  right: 0.3rem;
  background: none;
  border: none;
  color: #ff4444;
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.2s;
}

.set-chip:hover .delete-set-btn {
  opacity: 1;
}

.set-chip small {
  opacity: 0.6;
}

.no-sets {
  color: #4a5c54;
  font-style: italic;
  font-size: 0.9rem;
}

/* History */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-card {
  border: 1px solid #26352f;
  border-radius: 12px;
  overflow: hidden;
  background: #0d1210;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 0.75rem;
}

.history-toggle {
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  text-align: left;
}

.delete-session-btn {
  background: none;
  border: none;
  color: #ff4444;
  cursor: pointer;
  padding: 0.5rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.delete-session-btn:hover {
  opacity: 1;
}

.history-main {
  display: flex;
  flex-direction: column;
}

.history-main small {
  color: #9ba9a3;
}

.history-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #9ba9a3;
}

.chevron {
  font-size: 0.6rem;
  transition: transform 0.2s;
}

.chevron.open {
  transform: rotate(180deg);
}

.history-detail {
  padding: 1rem;
  background: #111a16;
  border-top: 1px solid #26352f;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.primary-action {
  background: #2fb174;
  color: #08100c;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.1s;
}

.primary-action:active {
  transform: scale(0.98);
}

@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
  
  .history {
    order: 3;
  }
}

@media (max-width: 600px) {
  .page-heading {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .user-summary {
    width: 100%;
    align-items: center;
  }
  
  .button-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .panel {
    padding: 1rem;
  }
}
</style>
