import { defineStore } from 'pinia';
import { ref } from 'vue';
import { userService } from '../api/userService';
import type { User, UserWithWeight, Weight } from '../types';

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([]);
  const currentUser = ref<UserWithWeight | null>(null);
  const currentUserId = ref<number | null>(null);
  const weightHistory = ref<Weight[]>([]);
  const loading = ref(false);

  async function fetchUsers() {
    loading.value = true;
    try {
      const response = await userService.getUsers();
      users.value = response.data;
      if (users.value.length > 0) {
        await selectUser(1); // Default to user 1
      }
    } finally {
      loading.value = false;
    }
  }

  async function selectUser(id: number) {
    loading.value = true;
    try {
      const response = await userService.getUser(id);
      currentUser.value = response.data;
      currentUserId.value = id;
      await fetchWeightHistory(id);
    } finally {
      loading.value = false;
    }
  }

  async function fetchWeightHistory(userId: number) {
    const response = await userService.getWeightHistory(userId);
    weightHistory.value = response.data;
  }

  async function updateWeight(weightBefore: number, weightAfter: number) {
    if (currentUserId.value === null) return;
    const response = await userService.updateWeight({
      userId: currentUserId.value,
      weightBefore,
      weightAfter,
    });
    currentUser.value = response.data;
    await fetchWeightHistory(currentUserId.value);
  }

  async function deleteUser(id: number) {
    await userService.deleteUser(id);
    users.value = users.value.filter(u => u.id !== id);
  }

  return { users, currentUser, currentUserId, weightHistory, loading, fetchUsers, selectUser, updateWeight, deleteUser };
});
