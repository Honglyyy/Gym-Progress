<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useSplitStore } from '../stores/split';
import { useExerciseStore } from '../stores/exercise';

const splitStore = useSplitStore();
const exerciseStore = useExerciseStore();

const newSplitName = ref('');
const sessions = ref<{ sessionName: string; exerciseIds: number[] }[]>([
  { sessionName: '', exerciseIds: [] }
]);

const editingSplitId = ref<number | null>(null);

const showExerciseModal = ref(false);
const editingExerciseId = ref<number | null>(null);
const activeSessionIndex = ref<number | null>(null);
const newExerciseName = ref('');
const selectedMuscleGroupId = ref<number | null>(null);
const muscleGroups = ref<{ id: number; muscleGroups: string }[]>([]);

onMounted(async () => {
  splitStore.fetchSplits();
  exerciseStore.fetchExercises();
  try {
    const response = await fetch('/api/v1/muscle-groups');
    muscleGroups.value = await response.json();
  } catch (e) {
    console.error('Failed to fetch muscle groups', e);
  }
});

const addSessionRow = () => {
  sessions.value.push({ sessionName: '', exerciseIds: [] });
};

const removeSessionRow = (index: number) => {
  sessions.value.splice(index, 1);
};

const openExerciseModal = (index: number | null = null, exercise: any = null) => {
  activeSessionIndex.value = index;
  if (exercise) {
    editingExerciseId.value = exercise.id;
    newExerciseName.value = exercise.exerciseName;
    const mg = muscleGroups.value.find(m => m.muscleGroups === exercise.muscleGroup);
    selectedMuscleGroupId.value = mg ? mg.id : null;
  } else {
    editingExerciseId.value = null;
    newExerciseName.value = '';
    selectedMuscleGroupId.value = null;
  }
  showExerciseModal.value = true;
};

const handleSaveExercise = async () => {
  if (newExerciseName.value && selectedMuscleGroupId.value) {
    if (editingExerciseId.value) {
      await exerciseStore.updateExercise(editingExerciseId.value, newExerciseName.value, selectedMuscleGroupId.value);
    } else {
      const exercise = await exerciseStore.addExercise(newExerciseName.value, selectedMuscleGroupId.value);
      if (activeSessionIndex.value !== null) {
        sessions.value[activeSessionIndex.value].exerciseIds.push(exercise.id);
      }
    }
    newExerciseName.value = '';
    selectedMuscleGroupId.value = null;
    showExerciseModal.value = false;
    editingExerciseId.value = null;
  }
};

const handleEditSplit = (split: any) => {
  editingSplitId.value = split.id;
  newSplitName.value = split.splitName;
  sessions.value = split.sessions.map((s: any) => ({
    sessionName: s.sessionName,
    exerciseIds: s.exercises.map((e: any) => e.id)
  }));
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  editingSplitId.value = null;
  newSplitName.value = '';
  sessions.value = [{ sessionName: '', exerciseIds: [] }];
};

const handleAddSplit = async () => {
  if (newSplitName.value.trim() && sessions.value.every(s => s.sessionName.trim() && s.exerciseIds.length > 0)) {
    if (editingSplitId.value) {
      await splitStore.updateSplit(editingSplitId.value, newSplitName.value, sessions.value);
    } else {
      await splitStore.addSplit(newSplitName.value, sessions.value);
    }
    cancelEdit();
  }
};
</script>

<template>
  <div class="splits-container">
    <section class="page-header">
      <h1>Workout Splits</h1>
      <p>Organize your training into programs and sessions.</p>
    </section>

    <div class="split-layout">
      <!-- Create/Edit Split Section -->
      <section class="panel create-panel">
        <div class="panel-header">
          <h2>{{ editingSplitId ? 'Edit Split' : 'Create New Split' }}</h2>
          <button v-if="editingSplitId" class="cancel-link" @click="cancelEdit">Cancel Editing</button>
        </div>
        
        <div class="form-body">
          <div class="input-group">
            <label>Split Name (e.g., PPL, Arnold Split)</label>
            <input v-model="newSplitName" placeholder="Enter split name..." />
          </div>

          <div class="sessions-setup">
            <div class="setup-header">
              <h3>Sessions</h3>
              <button class="add-session-btn" @click="addSessionRow">+ Add Session</button>
            </div>

            <div v-for="(session, index) in sessions" :key="index" class="session-form-row">
              <div class="row-header">
                <h4>Session {{ index + 1 }}</h4>
                <button v-if="sessions.length > 1" class="remove-btn" @click="removeSessionRow(index)">×</button>
              </div>

              <div class="input-group">
                <input v-model="session.sessionName" placeholder="Session Name (e.g., Push, Day A)" />
              </div>

              <div class="exercise-picker">
                <div class="picker-header">
                  <p class="picker-label">Select Exercises:</p>
                  <button class="inline-add-btn" @click="openExerciseModal(index)">+ New Exercise</button>
                </div>
                <div class="exercise-grid">
                  <div v-for="ex in exerciseStore.exercises" :key="ex.id" class="exercise-chip-wrapper">
                    <label class="exercise-chip" :class="{ selected: session.exerciseIds.includes(ex.id) }">
                      <input type="checkbox" :value="ex.id" v-model="session.exerciseIds" />
                      <span>{{ ex.exerciseName }}</span>
                    </label>
                    <button class="edit-ex-btn" @click.stop="openExerciseModal(null, ex)">✎</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            class="primary-action create-btn" 
            @click="handleAddSplit" 
            :disabled="!newSplitName || sessions.some(s => !s.sessionName || s.exerciseIds.length === 0)"
          >
            {{ editingSplitId ? 'Update Split Program' : 'Create Split Program' }}
          </button>
        </div>
      </section>

      <!-- Split List Section -->
      <section class="panel list-panel">
        <div class="panel-header">
          <h2>Your Splits</h2>
          <span class="count">{{ splitStore.splits.length }}</span>
        </div>

        <div v-if="splitStore.loading" class="loading">Loading programs...</div>
        <div v-else class="split-list">
          <div v-for="split in splitStore.splits" :key="split.id" class="split-card" :class="{ editing: editingSplitId === split.id }">
            <div class="card-header">
              <h3>{{ split.splitName }}</h3>
              <div class="card-actions">
                <button class="icon-btn edit" @click="handleEditSplit(split)" title="Edit Split">✎</button>
                <button class="icon-btn delete" @click="splitStore.deleteSplit(split.id)" title="Delete Split">🗑</button>
              </div>
            </div>
            
            <div class="sessions-preview">
              <div v-for="session in split.sessions" :key="session.id" class="session-tag">
                <span class="session-name">{{ session.sessionName }}</span>
                <span class="exercise-count">{{ session.exercises.length }} exercises</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Exercise Modal -->
    <div v-if="showExerciseModal" class="modal-overlay" @click.self="showExerciseModal = false">
      <div class="modal">
        <h3>{{ editingExerciseId ? 'Edit Exercise' : 'Create New Exercise' }}</h3>
        <div class="modal-form">
          <div class="input-group">
            <label>Exercise Name</label>
            <input v-model="newExerciseName" placeholder="Bench Press, Squat..." />
          </div>
          <div class="input-group">
            <label>Muscle Group</label>
            <select v-model="selectedMuscleGroupId">
              <option :value="null" disabled>Select muscle group</option>
              <option v-for="mg in muscleGroups" :key="mg.id" :value="mg.id">{{ mg.muscleGroups }}</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="cancel-btn" @click="showExerciseModal = false">Cancel</button>
            <button class="primary-action" @click="handleSaveExercise" :disabled="!newExerciseName || !selectedMuscleGroupId">
              {{ editingExerciseId ? 'Update' : 'Create & Add' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.splits-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2.5rem;
}

.page-header p {
  color: #9ba9a3;
  margin: 0.5rem 0 0;
}

.split-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 1.5rem;
  align-items: start;
}

.panel {
  background: #121816;
  border: 1px solid #31433b;
  border-radius: 16px;
  overflow: hidden;
}

.panel-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #31433b;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255,255,255,0.02);
}

.panel-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #c9d8d0;
}

.cancel-link {
  background: none;
  border: none;
  color: #ff4444;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.form-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  color: #9ba9a3;
  margin-bottom: 0.5rem;
}

input, select {
  width: 100%;
  padding: 0.85rem;
  background: #0d1210;
  border: 1px solid #31433b;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

input:focus, select:focus {
  outline: none;
  border-color: #2fb174;
}

.setup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.setup-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #2fb174;
}

.add-session-btn {
  background: rgba(47, 177, 116, 0.1);
  color: #2fb174;
  border: 1px dashed #2fb174;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.session-form-row {
  background: #0d1210;
  border: 1px solid #26352f;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.row-header h4 {
  margin: 0;
  font-size: 0.9rem;
  color: #9ba9a3;
}

.remove-btn {
  background: none;
  border: none;
  color: #ff4444;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.exercise-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.picker-label {
  font-size: 0.8rem;
  color: #9ba9a3;
  margin: 0;
}

.inline-add-btn {
  background: none;
  border: none;
  color: #2fb174;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.exercise-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.exercise-chip-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.exercise-chip {
  position: relative;
  padding: 0.4rem 2rem 0.4rem 0.8rem;
  background: #121816;
  border: 1px solid #31433b;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-ex-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: #9ba9a3;
  font-size: 0.75rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  padding: 0.2rem;
}

.edit-ex-btn:hover {
  opacity: 1;
  color: #2fb174;
}

.exercise-chip input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.exercise-chip.selected {
  background: rgba(47, 177, 116, 0.2);
  border-color: #2fb174;
  color: #2fb174;
}

.primary-action {
  width: 100%;
  padding: 1rem;
  background: #2fb174;
  color: #08100c;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
}

.primary-action:disabled {
  background: #1e3129;
  color: #4a5c54;
  cursor: not-allowed;
}

.split-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
}

.split-card {
  background: #0d1210;
  border: 1px solid #26352f;
  border-radius: 12px;
  padding: 1rem;
  transition: border-color 0.2s;
}

.split-card.editing {
  border-color: #2fb174;
  background: #16221d;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.sessions-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.session-tag {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #121816;
  border-radius: 8px;
  font-size: 0.85rem;
}

.session-name {
  font-weight: 600;
  color: #c9d8d0;
}

.exercise-count {
  color: #9ba9a3;
  font-size: 0.75rem;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: rgba(255,255,255,0.05);
}

.delete:hover {
  color: #ff4444;
}

.count {
  background: #2fb174;
  color: #08100c;
  padding: 0.1rem 0.5rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 800;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: #121816;
  border: 1px solid #31433b;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  padding: 1.5rem;
}

.modal h3 {
  margin: 0 0 1.5rem;
  font-size: 1.3rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  margin-top: 0.5rem;
}

.cancel-btn {
  background: #1a2420;
  color: #9ba9a3;
  border: 1px solid #31433b;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 900px) {
  .split-layout {
    grid-template-columns: 1fr;
  }
  
  .list-panel {
    order: -1;
  }
}

@media (max-width: 500px) {
  .exercise-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
