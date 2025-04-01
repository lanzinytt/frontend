<template>
  <div class="card-container">
    <h1>登录网上服务大厅</h1>
    <form @submit.prevent="handleLogin">
      <label for="username">用户名:</label>
      <input id="username" v-model="username" type="text" required />

      <label for="password">密码:</label>
      <input id="password" v-model="password" type="password" required />

      <button type="submit">登录</button>
    </form>
    <p>
      如果还没有账号，请
      <router-link to="/register">注册</router-link>
    </p>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'LoginForm',
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    async handleLogin() {
      try {
        const response = await axios.post('http://localhost:3000/auth/login', {
          username: this.username,
          password: this.password,
        });
        console.log(response.data);
        this.$router.push('/hall');
      } catch (err) {
        console.error(err);
        alert('登录失败，请检查用户名或密码');
      }
    },
  },
};
</script>

<!-- 注意：如果页面中不需要额外的样式，可省略局部style -->
<style scoped>
/* 此处可以添加局部组件定制样式，若希望全部使用全局样式，请勿设置 scoped */
</style>