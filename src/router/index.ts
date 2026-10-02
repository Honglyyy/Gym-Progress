import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/splits',
      name: 'splits',
      component: () => import('../views/SplitsView.vue'),
    },
    {
      path: '/exercises',
      name: 'exercises',
      component: () => import('../views/ExercisesView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const isLoggedIn = localStorage.getItem('gym_auth_logged_in') === 'true';
  if (to.name !== 'login' && !isLoggedIn) {
    next({ name: 'login' });
  } else if (to.name === 'login' && isLoggedIn) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;
