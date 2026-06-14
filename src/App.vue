<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <header class="app-header">
    <nav>
      <RouterLink to="/">Dashboard</RouterLink>
      <RouterLink to="/splits">Splits</RouterLink>
      <RouterLink to="/exercises">Exercises</RouterLink>
      <RouterLink to="/profile">Profile</RouterLink>
    </nav>
  </header>

  <main>
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
  justify-content: center;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0.75rem 0;
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

main {
  padding: 1.25rem;
  max-width: 1180px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .app-header {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  nav {
    justify-content: flex-start;
  }

  main {
    padding: 1rem 0.75rem calc(1rem + env(safe-area-inset-bottom));
  }
}
</style>
