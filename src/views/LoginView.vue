<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();

const pin = ref('');
const error = ref('');
const isSubmitting = ref(false);
const isShaking = ref(false);
const hiddenInputRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
  focusInput();
});

const focusInput = () => {
  nextTick(() => {
    hiddenInputRef.value?.focus();
  });
};

const handleDigitPress = (digit: string) => {
  if (pin.value.length < 4) {
    pin.value += digit;
    error.value = '';
    if (pin.value.length === 4) {
      submitPin();
    }
  }
};

const handleBackspace = () => {
  if (pin.value.length > 0) {
    pin.value = pin.value.slice(0, -1);
    error.value = '';
  }
};

const handleClear = () => {
  pin.value = '';
  error.value = '';
};

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const digits = target.value.replace(/\D/g, '').slice(0, 4);
  pin.value = digits;
  target.value = digits;
  error.value = '';
  if (pin.value.length === 4) {
    submitPin();
  }
};

const submitPin = async () => {
  if (pin.value.length !== 4 || isSubmitting.value) return;

  isSubmitting.value = true;
  error.value = '';

  const success = await userStore.login(pin.value);
  if (success) {
    router.push('/');
  } else {
    isShaking.value = true;
    error.value = 'Incorrect PIN. Please try again.';
    setTimeout(() => {
      isShaking.value = false;
      pin.value = '';
      if (hiddenInputRef.value) hiddenInputRef.value.value = '';
      focusInput();
    }, 600);
  }
  isSubmitting.value = false;
};

const fillDefaultPin = () => {
  pin.value = '1234';
  if (hiddenInputRef.value) hiddenInputRef.value.value = '1234';
  submitPin();
};
</script>

<template>
  <div class="login-wrapper" @click="focusInput">
    <div class="login-card" :class="{ shake: isShaking }">
      <div class="card-glow"></div>

      <header class="login-header">
        <div class="logo-circle">
          <span class="logo-icon">🏋️</span>
        </div>
        <div class="header-titles">
          <h1>Gym Progress</h1>
          <span class="badge">Internal Access</span>
        </div>
        <p class="subtitle">Enter 4-digit PIN to access your workout tracker</p>
      </header>

      <!-- Hidden real input for mobile / hardware keyboard input -->
      <input
        ref="hiddenInputRef"
        type="password"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="4"
        :value="pin"
        @input="handleInput"
        class="hidden-pin-input"
        autocomplete="off"
      />

      <!-- PIN Digits Display -->
      <div class="pin-display">
        <div
          v-for="i in 4"
          :key="i"
          class="pin-dot"
          :class="{ filled: pin.length >= i, active: pin.length === i - 1 }"
        >
          <span v-if="pin.length >= i" class="bullet">●</span>
        </div>
      </div>

      <!-- Error message -->
      <div class="error-container">
        <p v-if="error" class="error-msg">{{ error }}</p>
        <p v-else class="hint-msg">Default PIN: <strong>1234</strong></p>
      </div>

      <!-- On-screen numeric keypad -->
      <div class="keypad">
        <button
          v-for="digit in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
          :key="digit"
          type="button"
          class="key-btn"
          @click.stop="handleDigitPress(digit)"
        >
          {{ digit }}
        </button>
        <button type="button" class="key-btn utility" @click.stop="handleClear" title="Clear">
          C
        </button>
        <button type="button" class="key-btn" @click.stop="handleDigitPress('0')">
          0
        </button>
        <button type="button" class="key-btn utility" @click.stop="handleBackspace" title="Backspace">
          ⌫
        </button>
      </div>

      <div class="card-footer">
        <button type="button" class="quick-fill-btn" @click.stop="fillDefaultPin">
          Quick Fill Default PIN (1234)
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 1.5rem;
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 380px;
  background: linear-gradient(160deg, #16241e 0%, #0d1210 100%);
  border: 1px solid #31433b;
  border-radius: 24px;
  padding: 2.25rem 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(47, 177, 116, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.card-glow {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 120px;
  background: radial-gradient(circle, rgba(47, 177, 116, 0.3) 0%, transparent 70%);
  pointer-events: none;
}

.login-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.logo-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(47, 177, 116, 0.15);
  border: 2px solid #2fb174;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(47, 177, 116, 0.3);
  margin-bottom: 0.25rem;
}

.logo-icon {
  font-size: 1.8rem;
}

.header-titles {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.login-header h1 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: white;
}

.badge {
  background: rgba(47, 177, 116, 0.2);
  color: #2fb174;
  border: 1px solid rgba(47, 177, 116, 0.4);
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.2rem 0.5rem;
  border-radius: 99px;
}

.subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: #9ba9a3;
}

/* Hidden input capturing typing */
.hidden-pin-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 1px;
  height: 1px;
}

/* PIN Display */
.pin-display {
  display: flex;
  gap: 1rem;
  margin: 1.25rem 0 0.5rem;
}

.pin-dot {
  width: 52px;
  height: 58px;
  border-radius: 12px;
  background: #0d1210;
  border: 2px solid #26352f;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pin-dot.active {
  border-color: #2fb174;
  box-shadow: 0 0 10px rgba(47, 177, 116, 0.3);
}

.pin-dot.filled {
  border-color: #2fb174;
  background: rgba(47, 177, 116, 0.1);
}

.bullet {
  font-size: 1.5rem;
  color: #2fb174;
  line-height: 1;
}

/* Messages */
.error-container {
  min-height: 24px;
  margin-bottom: 1rem;
  text-align: center;
}

.error-msg {
  margin: 0;
  color: #ff5252;
  font-size: 0.8rem;
  font-weight: 700;
  animation: fadeIn 0.2s ease;
}

.hint-msg {
  margin: 0;
  color: #63776e;
  font-size: 0.75rem;
}

.hint-msg strong {
  color: #9ba9a3;
}

/* Keypad */
.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  width: 100%;
  max-width: 280px;
}

.key-btn {
  aspect-ratio: 1.1;
  background: #111a16;
  border: 1px solid #26352f;
  border-radius: 14px;
  color: white;
  font-size: 1.4rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  user-select: none;
}

.key-btn:hover {
  background: #1a2721;
  border-color: #2fb174;
  transform: translateY(-1px);
}

.key-btn:active {
  background: #2fb174;
  color: #08100c;
  transform: translateY(1px);
}

.key-btn.utility {
  font-size: 1.1rem;
  color: #9ba9a3;
  background: rgba(17, 26, 22, 0.5);
}

.key-btn.utility:hover {
  color: white;
}

/* Footer */
.card-footer {
  margin-top: 1.25rem;
  width: 100%;
  display: flex;
  justify-content: center;
}

.quick-fill-btn {
  background: none;
  border: 1px dashed rgba(47, 177, 116, 0.4);
  color: #2fb174;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-fill-btn:hover {
  background: rgba(47, 177, 116, 0.1);
  border-color: #2fb174;
}

/* Shake Animation */
.shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-2px, 0, 0); }
  20%, 80% { transform: translate3d(4px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
  40%, 60% { transform: translate3d(6px, 0, 0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
