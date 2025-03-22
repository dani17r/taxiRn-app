<template>
    <div>
        <h1>Reset Password</h1>
        <form @submit.prevent="resetPassword">
            <div>
                <label for="email">Email</label>
                <input type="email" id="email" v-model="email" required>
            </div>
            <div>
                <button type="submit">Reset Password</button>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import superComposable from '@composables/super';

const { store } = superComposable();

export default defineComponent({
  setup() {
    const email = ref('');
    const router = useRouter();

    const resetPasswordHandler = async () => {
      try {
        await store.auth.resetPassword(email.value);
        await router.push({ name: 'login' });
      } catch (error) {
        console.error('Error resetting password:', error);
      }
    };

    return {
      email,
      resetPassword: resetPasswordHandler,
    };
  },
});
</script>