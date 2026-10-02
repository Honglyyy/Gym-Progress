import { defineStore } from 'pinia';
import { ref } from 'vue';
import { userService } from '../api/userService';
import type { User, UserWithWeight, Weight } from '../types';

export const useUserStore = defineStore('user', () => {
  const DEFAULT_PIN = '1234';
  const PIN_STORAGE_KEY = 'gym_auth_pin';
  const AUTH_STORAGE_KEY = 'gym_auth_logged_in';

  const users = ref<User[]>([]);
  const currentUser = ref<UserWithWeight | null>(null);
  const currentUserId = ref<number | null>(null);
  const weightHistory = ref<Weight[]>([]);
  const loading = ref(false);

  const isAuthenticated = ref<boolean>(localStorage.getItem(AUTH_STORAGE_KEY) === 'true');
  const storedPin = ref<string>(localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN);

  async function login(pin: string): Promise<boolean> {
    if (pin === storedPin.value) {
      isAuthenticated.value = true;
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      await fetchUsers();
      return true;
    }
    return false;
  }

  function logout() {
    isAuthenticated.value = false;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    currentUser.value = null;
    currentUserId.value = null;
  }

  function updatePin(oldPin: string, newPin: string): { success: boolean; message: string } {
    if (oldPin !== storedPin.value) {
      return { success: false, message: 'Current PIN is incorrect.' };
    }
    if (!/^\d{4}$/.test(newPin)) {
      return { success: false, message: 'New PIN must be exactly 4 digits.' };
    }
    storedPin.value = newPin;
    localStorage.setItem(PIN_STORAGE_KEY, newPin);
    return { success: true, message: 'PIN updated successfully!' };
  }

  async function fetchUsers() {
    loading.value = true;
    try {
      const response = await userService.getUsers();
      users.value = response.data;
      if (users.value.length > 0) {
        await selectUser(users.value[0].id || 1); // Default to own user
      } else {
        await selectUser(1);
      }
    } catch (e) {
      console.error('Error fetching users:', e);
      if (!currentUser.value) {
        await selectUser(1).catch(() => {});
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

  return {
    users,
    currentUser,
    currentUserId,
    weightHistory,
    loading,
    isAuthenticated,
    storedPin,
    login,
    logout,
    updatePin,
    fetchUsers,
    selectUser,
    updateWeight,
    deleteUser
  };
});
