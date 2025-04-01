<template>
  <div class="card-container">
    <h1>用户注册</h1>
    <form @submit.prevent="handleRegister">
      <label for="username">用户名:</label>
      <input id="username" v-model="username" type="text" required />

      <label for="password">密码:</label>
      <input id="password" v-model="password" type="password" required />

      <button type="submit">注册</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'RegisterForm',
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    async handleRegister() {
      try {
        await axios.post('http://localhost:3000/auth/register', {
          username: this.username,
          password: this.password,
        });
        alert('注册成功，请登录');
        this.$router.push('/');
      } catch (err) {
        // console.error(err);
        alert('注册失败，请重试');
      }
    },
  },
};
</script>

<style scoped>

</style>