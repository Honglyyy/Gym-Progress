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
      <div class="header-bg-glow"></div>
      <div class="user-info">
        <div class="avatar-container">
          <div class="avatar-ring"></div>
          <div class="avatar">{{ userStore.currentUser.username.charAt(0).toUpperCase() }}</div>
        </div>
        <div class="user-details">
          <h1>{{ userStore.currentUser.username }}</h1>
          <p class="stats-summary">
            <span class="stat-badge"><i class="icon">🎂</i> {{ userStore.currentUser.age }} yrs</span>
            <span class="stat-badge"><i class="icon">📏</i> {{ userStore.currentUser.height }} cm</span>
          </p>
        </div>
      </div>
      <div class="current-weight-card glass-panel">
        <p class="label">Current Weight</p>
        <div class="weight-display">
          <strong>{{ userStore.currentUser.weightAfter }}</strong>
          <span>kg</span>
        </div>
      </div>
    </section>

    <div class="profile-grid">
      <section class="panel weight-update premium-panel">
        <div class="panel-header">
          <h2>Update Weight</h2>
          <p class="subtitle">Track your progress today</p>
        </div>
        <div class="form-body">
          <div class="input-grid">
            <div class="input-group floating">
              <input v-model.number="weightBefore" type="number" step="0.1" id="weight-before" required />
              <label for="weight-before">Weight Before (kg)</label>
            </div>
            <div class="input-group floating">
              <input v-model.number="weightAfter" type="number" step="0.1" id="weight-after" required />
              <label for="weight-after">Weight After (kg)</label>
            </div>
          </div>
          <button 
            class="primary-action glowing-btn" 
            @click="handleUpdateWeight"
            :disabled="weightBefore === null || weightAfter === null"
          >
            Log Weight
          </button>
        </div>
      </section>

      <section class="panel history-panel premium-panel">
        <div class="panel-header">
          <h2>Weight History</h2>
        </div>
        <div class="history-list">
          <div v-if="userStore.weightHistory.length === 0" class="empty-state">
            <div class="empty-icon">⚖️</div>
            <p>No weight entries logged yet.</p>
          </div>
          <div v-for="entry in userStore.weightHistory" :key="entry.id" class="history-item animated-item">
            <div class="entry-date">{{ formatDate(entry.createdAt) }}</div>
            <div class="entry-values">
              <span class="val-before">{{ entry.weightBefore }}kg</span>
              <span class="arrow">→</span>
              <span class="val-after">{{ entry.weightAfter }}kg</span>
              <span class="diff" :class="{ gain: entry.weightAfter > entry.weightBefore, loss: entry.weightAfter < entry.weightBefore, maintain: entry.weightAfter === entry.weightBefore }">
                {{ entry.weightAfter > entry.weightBefore ? '+' : '' }}{{ (entry.weightAfter - entry.weightBefore).toFixed(1) }}kg
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
  <div v-else class="loading-state">
    <div class="spinner"></div>
    <p>Loading profile...</p>
  </div>
</template>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.profile-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #16241e 0%, #0d1210 100%);
  padding: 2.5rem;
  border-radius: 24px;
  border: 1px solid rgba(47, 177, 116, 0.2);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.header-bg-glow {
  position: absolute;
  top: -50%;
  left: -20%;
  width: 140%;
  height: 200%;
  background: radial-gradient(circle at 30% 50%, rgba(47, 177, 116, 0.15) 0%, transparent 60%);
  pointer-events: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 2rem;
  z-index: 1;
}

.avatar-container {
  position: relative;
  width: 90px;
  height: 90px;
}

.avatar-ring {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #2fb174, #121816, #2fb174);
  animation: spin 4s linear infinite;
  opacity: 0.5;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.avatar {
  position: relative;
  width: 100%;
  height: 100%;
  background: #2fb174;
  color: #08100c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 800;
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(47, 177, 116, 0.4);
}

.user-details h1 {
  margin: 0 0 0.5rem;
  font-size: 2.2rem;
  letter-spacing: -0.5px;
  background: linear-gradient(to right, #fff, #c7f0dd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stats-summary {
  display: flex;
  gap: 1rem;
}

.stat-badge {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #c7f0dd;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-panel {
  background: rgba(13, 18, 16, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(47, 177, 116, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.current-weight-card {
  text-align: right;
  padding: 1.5rem 2rem;
  border-radius: 20px;
  z-index: 1;
}

.current-weight-card .label {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #2fb174;
  font-weight: 600;
}

.weight-display {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.weight-display strong {
  font-size: 3.5rem;
  line-height: 1;
  color: white;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.weight-display span {
  font-size: 1.2rem;
  color: #9ba9a3;
  font-weight: 500;
}

.profile-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 2rem;
  align-items: start;
}

.premium-panel {
  background: #121816;
  border: 1px solid #26352f;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: border-color 0.3s ease;
}

.premium-panel:hover {
  border-color: #31433b;
}

.panel-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #26352f;
  background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
}

.panel-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.panel-header .subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #9ba9a3;
}

.form-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.input-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group.floating {
  position: relative;
}

.input-group.floating input {
  width: 100%;
  padding: 1.2rem 1rem 0.6rem;
  background: #0d1210;
  border: 1px solid #31433b;
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  transition: all 0.2s;
}

.input-group.floating input:focus {
  border-color: #2fb174;
  outline: none;
  box-shadow: 0 0 0 3px rgba(47, 177, 116, 0.1);
}

.input-group.floating label {
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-size: 1rem;
  color: #9ba9a3;
  transition: all 0.2s ease;
  pointer-events: none;
}

.input-group.floating input:focus ~ label,
.input-group.floating input:valid ~ label {
  top: 0.4rem;
  font-size: 0.75rem;
  color: #2fb174;
}

.glowing-btn {
  width: 100%;
  padding: 1.2rem;
  background: #2fb174;
  color: #08100c;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.glowing-btn:disabled {
  background: #1e3129;
  color: #4a5c54;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.glowing-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(47, 177, 116, 0.4);
}

.glowing-btn:not(:disabled):active {
  transform: translateY(1px);
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #1a2420;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.02);
}

.history-item:last-child {
  border-bottom: none;
}

.entry-date {
  font-size: 0.95rem;
  color: #9ba9a3;
  font-weight: 500;
}

.entry-values {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 700;
  font-size: 1.1rem;
}

.val-before {
  color: #9ba9a3;
}

.arrow {
  color: #4a5c54;
  font-size: 0.9rem;
}

.val-after {
  color: white;
}

.diff {
  font-size: 0.85rem;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  min-width: 60px;
  text-align: center;
  margin-left: 0.5rem;
}

.diff.gain {
  background: rgba(255, 68, 68, 0.15);
  color: #ff4444;
  border: 1px solid rgba(255, 68, 68, 0.3);
}

.diff.loss {
  background: rgba(47, 177, 116, 0.15);
  color: #2fb174;
  border: 1px solid rgba(47, 177, 116, 0.3);
}

.diff.maintain {
  background: rgba(255, 255, 255, 0.1);
  color: #c7f0dd;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  color: #4a5c54;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10rem 2rem;
  color: #9ba9a3;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(47, 177, 116, 0.2);
  border-top-color: #2fb174;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-header {
    flex-direction: column;
    gap: 2rem;
    align-items: flex-start;
    padding: 2rem;
  }
  
  .current-weight-card {
    width: 100%;
    text-align: center;
  }
  
  .weight-display {
    justify-content: center;
  }
}
</style>
