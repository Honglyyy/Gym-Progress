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
        <h3>{{ ex.exerciseName }}</h3>
        <p class="tag">{{ ex.muscleGroup }}</p>
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.exercise-card {
  padding: 1rem;
  border: 1px solid #444;
  border-radius: 8px;
  background: #1a1a1a;
}

.tag {
  display: inline-block;
  background: #41b883;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
}
</style>
