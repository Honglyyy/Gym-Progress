<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const weightBefore = ref<number | null>(null);
const weightAfter = ref<number | null>(null);

onMounted(() => {
  userStore.fetchUsers();
});

const handleUpdateWeight = async () => {
  if (weightBefore.value !== null && weightAfter.value !== null) {
    await userStore.updateWeight(weightBefore.value, weightAfter.value);
    weightBefore.value = null;
    weightAfter.value = null;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <div class="profile-view" v-if="userStore.currentUser">
    <section class="profile-header">
      <div class="user-info">
        <div class="avatar">{{ userStore.currentUser.username.charAt(0).toUpperCase() }}</div>
        <div>
          <h1>{{ userStore.currentUser.username }}</h1>
          <p class="stats-summary">
            <span>{{ userStore.currentUser.age }} years</span>
            <span>{{ userStore.currentUser.height }} cm</span>
          </p>
        </div>
      </div>
      <div class="current-weight-card">
        <p class="label">Current Weight</p>
        <strong>{{ userStore.currentUser.weightAfter }} <span>kg</span></strong>
      </div>
    </section>

    <div class="profile-grid">
      <section class="panel weight-update">
        <div class="panel-header">
          <h2>Update Weight</h2>
        </div>
        <div class="form-body">
          <div class="input-grid">
            <div class="input-group">
              <label>Weight Before (kg)</label>
              <input v-model.number="weightBefore" type="number" step="0.1" placeholder="0.0" />
            </div>
            <div class="input-group">
              <label>Weight After (kg)</label>
              <input v-model.number="weightAfter" type="number" step="0.1" placeholder="0.0" />
            </div>
          </div>
          <button 
            class="primary-action" 
            @click="handleUpdateWeight"
            :disabled="weightBefore === null || weightAfter === null"
          >
            Log Weight
          </button>
        </div>
      </section>

      <section class="panel history-panel">
        <div class="panel-header">
          <h2>Weight History</h2>
        </div>
        <div class="history-list">
          <div v-if="userStore.weightHistory.length === 0" class="empty-state">
            No weight entries logged yet.
          </div>
          <div v-for="entry in userStore.weightHistory" :key="entry.id" class="history-item">
            <div class="entry-date">{{ formatDate(entry.createdAt) }}</div>
            <div class="entry-values">
              <span class="val-before">{{ entry.weightBefore }}kg</span>
              <span class="arrow">→</span>
              <span class="val-after">{{ entry.weightAfter }}kg</span>
              <span class="diff" :class="{ gain: entry.weightAfter > entry.weightBefore, loss: entry.weightAfter < entry.weightBefore }">
                {{ entry.weightAfter > entry.weightBefore ? '+' : '' }}{{ (entry.weightAfter - entry.weightBefore).toFixed(1) }}kg
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
  <div v-else class="loading-state">Loading profile...</div>
</template>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #121816;
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid #31433b;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar {
  width: 80px;
  height: 80px;
  background: #2fb174;
  color: #08100c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
  border-radius: 24px;
}

.user-info h1 {
  margin: 0;
  font-size: 2rem;
}

.stats-summary {
  margin: 0.5rem 0 0;
  display: flex;
  gap: 1rem;
  color: #9ba9a3;
}

.current-weight-card {
  text-align: right;
  padding: 1rem 1.5rem;
  background: rgba(47, 177, 116, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(47, 177, 116, 0.2);
}

.current-weight-card .label {
  margin: 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #2fb174;
}

.current-weight-card strong {
  font-size: 2.5rem;
  color: white;
}

.current-weight-card strong span {
  font-size: 1rem;
  font-weight: 400;
  color: #9ba9a3;
}

.profile-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
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
  padding: 1.25rem;
  border-bottom: 1px solid #31433b;
  background: rgba(255,255,255,0.02);
}

.panel-header h2 {
  margin: 0;
  font-size: 1.1rem;
}

.form-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  color: #9ba9a3;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.85rem;
  background: #0d1210;
  border: 1px solid #31433b;
  border-radius: 8px;
  color: white;
}

.primary-action {
  width: 100%;
  padding: 1rem;
  background: #2fb174;
  color: #08100c;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
}

.primary-action:disabled {
  background: #1e3129;
  color: #4a5c54;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  padding: 1.25rem;
  border-bottom: 1px solid #1a2420;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-item:last-child {
  border-bottom: none;
}

.entry-date {
  font-size: 0.9rem;
  color: #9ba9a3;
}

.entry-values {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
}

.arrow {
  color: #4a5c54;
}

.diff {
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  min-width: 50px;
  text-align: center;
}

.diff.gain {
  background: rgba(255, 68, 68, 0.1);
  color: #ff4444;
}

.diff.loss {
  background: rgba(47, 177, 116, 0.1);
  color: #2fb174;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #4a5c54;
  font-style: italic;
}

.loading-state {
  padding: 5rem;
  text-align: center;
  font-size: 1.2rem;
  color: #9ba9a3;
}

@media (max-width: 850px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-header {
    flex-direction: column;
    gap: 1.5rem;
    align-items: flex-start;
  }
  
  .current-weight-card {
    width: 100%;
    text-align: center;
  }
}
</style>
