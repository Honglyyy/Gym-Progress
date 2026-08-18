<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useExerciseStore } from '../stores/exercise';
import { muscleGroupService } from '../api/muscleGroupService';
import { MuscleGroup } from '../types';
import type { MuscleGroupOption } from '../types';

const exerciseStore = useExerciseStore();
const selectedMuscleGroup = ref<MuscleGroup | undefined>(undefined);
const muscleGroupOptions = ref<MuscleGroupOption[]>([]);
const newExerciseName = ref('');
const newMuscleGroupId = ref<number | undefined>(undefined);

const editingExerciseId = ref<number | null>(null);
const editingExerciseName = ref('');
const editingMuscleGroupId = ref<number | undefined>(undefined);

const muscleGroups = Object.values(MuscleGroup);

onMounted(async () => {
  await Promise.all([
    exerciseStore.fetchExercises(),
    muscleGroupService.getMuscleGroups().then(response => {
      muscleGroupOptions.value = response.data;
    }),
  ]);
});

const filterByMuscleGroup = () => {
  exerciseStore.fetchExercises(selectedMuscleGroup.value);
};

const handleAddExercise = async () => {
  if (!newExerciseName.value.trim()) return;

  await exerciseStore.addExercise(newExerciseName.value.trim(), newMuscleGroupId.value);
  newExerciseName.value = '';
  newMuscleGroupId.value = undefined;
};

const handleEdit = (ex: any) => {
  editingExerciseId.value = ex.id;
  editingExerciseName.value = ex.exerciseName;
  const mgOption = muscleGroupOptions.value.find(mg => mg.muscleGroup === ex.muscleGroup);
  editingMuscleGroupId.value = mgOption ? mgOption.id : undefined;
};

const handleUpdate = async () => {
  if (editingExerciseId.value && editingExerciseName.value.trim()) {
    await exerciseStore.updateExercise(editingExerciseId.value, editingExerciseName.value.trim(), editingMuscleGroupId.value);
    editingExerciseId.value = null;
  }
};

const cancelEdit = () => {
  editingExerciseId.value = null;
};

const handleDelete = async (id: number) => {
  if (confirm('Are you sure you want to delete this exercise?')) {
    await exerciseStore.deleteExercise(id);
  }
};
</script>

<template>
  <div class="exercises">
    <h1>Exercise Library</h1>

    <div class="add-exercise">
      <h2>Add Exercise</h2>
      <input v-model="newExerciseName" placeholder="Exercise name" />
      <select v-model.number="newMuscleGroupId">
        <option :value="undefined">No muscle group</option>
        <option v-for="mg in muscleGroupOptions" :key="mg.id" :value="mg.id">
          {{ mg.muscleGroup }}
        </option>
      </select>
      <button @click="handleAddExercise" :disabled="!newExerciseName.trim()">Add</button>
    </div>

    <div class="filters">
      <label for="muscle-group">Filter by Muscle Group:</label>
      <select id="muscle-group" v-model="selectedMuscleGroup" @change="filterByMuscleGroup">
        <option :value="undefined">All</option>
        <option v-for="mg in muscleGroups" :key="mg" :value="mg">{{ mg }}</option>
      </select>
    </div>

    <div v-if="exerciseStore.loading">Loading exercises...</div>
    <div v-else class="exercise-grid">
      <div v-for="ex in exerciseStore.exercises" :key="ex.id" class="exercise-card">
        <div v-if="editingExerciseId === ex.id" class="edit-mode">
          <input v-model="editingExerciseName" class="edit-input" />
          <select v-model.number="editingMuscleGroupId" class="edit-select">
            <option :value="undefined">No muscle group</option>
            <option v-for="mg in muscleGroupOptions" :key="mg.id" :value="mg.id">
              {{ mg.muscleGroup }}
            </option>
          </select>
          <div class="edit-actions">
            <button class="save-btn" @click="handleUpdate" :disabled="!editingExerciseName.trim()">Save</button>
            <button class="cancel-btn" @click="cancelEdit">Cancel</button>
          </div>
        </div>
        <div v-else>
          <div class="card-header">
            <h3>{{ ex.exerciseName }}</h3>
            <div class="card-actions">
              <button class="icon-btn edit-btn" @click="handleEdit(ex)" title="Edit">✎</button>
              <button class="icon-btn delete-btn" @click="handleDelete(ex.id)" title="Delete">🗑</button>
            </div>
          </div>
          <p class="tag">{{ ex.muscleGroup || 'Uncategorized' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filters {
  margin-bottom: 2rem;
}

.add-exercise {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #444;
  border-radius: 8px;
  background: #1a1a1a;
}

input,
select {
  padding: 0.5rem;
  background: #333;
  border: 1px solid #666;
  color: white;
  border-radius: 4px;
}

.filters select {
  margin-left: 0.5rem;
}

.exercise-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.exercise-card {
  padding: 1rem;
  border: 1px solid #444;
  border-radius: 8px;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
}

.icon-btn {
  background: none;
  border: none;
  padding: 0.2rem 0.4rem;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s, color 0.2s;
}

.icon-btn:hover {
  opacity: 1;
}

.edit-btn:hover {
  color: #2fb174;
}

.delete-btn:hover {
  color: #e74c3c;
}

.tag {
  display: inline-block;
  background: #41b883;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
  margin: 0;
}

.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-input,
.edit-select {
  width: 100%;
  box-sizing: border-box;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.save-btn,
.cancel-btn {
  flex: 1;
  padding: 0.4rem;
  font-size: 0.9rem;
}

.save-btn {
  background-color: #2fb174;
  color: #08100d;
}

.save-btn:hover:not(:disabled) {
  background-color: #38c886;
}

.cancel-btn {
  background-color: transparent;
  border: 1px solid #666;
}

.cancel-btn:hover {
  background-color: #333;
}
</style>
