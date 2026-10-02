<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { useUserStore } from './stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const isLoginPage = computed(() => route.name === 'login');

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<template>
  <header class="app-header" v-if="!isLoginPage && userStore.isAuthenticated">
    <nav>
      <div class="nav-links">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/splits">Splits</RouterLink>
        <RouterLink to="/exercises">Exercises</RouterLink>
        <RouterLink to="/profile">Profile</RouterLink>
      </div>
      <button class="logout-btn" @click="handleLogout" title="Lock app and log out">
        <span class="lock-icon">🔒</span>
        <span class="logout-text">Lock</span>
      </button>
    </nav>
  </header>

  <main :class="{ 'auth-main': isLoginPage }">
    <RouterView />
  </main>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: env(safe-area-inset-top) 1rem 0;
  background: rgba(8, 16, 13, 0.88);
  border-bottom: 1px solid #1f3029;
  backdrop-filter: blur(12px);
}

nav {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
  align-items: center;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0.75rem 0;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
}

nav a {
  flex: 0 0 auto;
  text-decoration: none;
  font-weight: 700;
  padding: 0.55rem 0.8rem;
  border-radius: 8px;
  color: #aab9b2;
}

nav a.router-link-exact-active {
  color: #07100c;
  background: #2fb174;
}

.logout-btn {
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.25);
  color: #ff6b6b;
  font-weight: 700;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: rgba(255, 68, 68, 0.2);
  border-color: #ff6b6b;
  color: white;
}

main {
  padding: 1.25rem;
  max-width: 1180px;
  margin: 0 auto;
}

.auth-main {
  padding: 0;
  max-width: 100%;
}

@media (max-width: 640px) {
  .app-header {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .nav-links {
    justify-content: flex-start;
  }

  main {
    padding: 1rem 0.75rem calc(1rem + env(safe-area-inset-bottom));
  }
}
</style>
