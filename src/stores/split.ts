import { defineStore } from 'pinia';
import { ref } from 'vue';
import { splitService } from '../api/splitService';
import type { Split } from '../types';

export const useSplitStore = defineStore('split', () => {
  const splits = ref<Split[]>([]);
  const loading = ref(false);

  async function fetchSplits() {
    loading.value = true;
    try {
      const response = await splitService.getSplits();
      splits.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function addSplit(name: string, sessions: { sessionName: string, exerciseIds: number[] }[]) {
    const response = await splitService.addSplit(name, sessions);
    splits.value.push(response.data);
  }

  async function deleteSplit(id: number) {
    await splitService.deleteSplit(id);
    splits.value = splits.value.filter(s => s.id !== id);
  }

  async function updateSplit(id: number, name: string, sessions: { sessionName: string, exerciseIds: number[] }[]) {
    const response = await splitService.updateSplit(id, name, sessions);
    const index = splits.value.findIndex(s => s.id === id);
    if (index !== -1) {
      splits.value[index] = response.data;
    }
  }

  return { splits, loading, fetchSplits, addSplit, deleteSplit, updateSplit };
});
