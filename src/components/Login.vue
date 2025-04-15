<template>
  <div class="login-wrapper">
    <!-- 轮播背景 -->
    <div class="slideshow"></div>

    <!-- 根据当前索引显示不同作者 -->
    <div class="author-credit">{{ 'Author：' + authors[currentAuthorIndex] }}</div>

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
      authors: ['ﾍﾅﾁｮｺ', 'NEKO♨', '训林','c7肘'],
      currentAuthorIndex: 0
    };
  },
  mounted() {
    // 每隔 5 秒切换一次作者索引，可根据需求调整
    setInterval(() => {
      this.currentAuthorIndex = (this.currentAuthorIndex + 1) % this.authors.length;
    }, 5000);
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

<style scoped>
.login-wrapper {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

/* 轮播容器 */
.slideshow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('@/assets/bg1.jpg') center center no-repeat; /* 居中背景 */
  background-size: cover; /* 等比剪切，覆盖视窗 */
  animation: slideShow 15s infinite;
  z-index: -1;
}

/* 简易切换3幅背景 */
@keyframes slideShow {
  0%   { background: url('@/assets/bg1.jpg') center center no-repeat; background-size: cover; }
  25%  { background: url('@/assets/bg2.jpg') center center no-repeat; background-size: cover; }
  50%  { background: url('@/assets/bg3.jpg') center center no-repeat; background-size: cover; }
  75%  { background: url('@/assets/bg4.jpg') center center no-repeat; background-size: cover; }
  100% { background: url('@/assets/bg1.jpg') center center no-repeat; background-size: cover; }
}

/* 作者文案 */
.author-credit {
  position: absolute;
  bottom: 10px;
  left: 10px;
  /* 文字改成白色 */
  color: #fff;
  font-size: 14px;
  /* 半透明灰底 */
  background-color: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
  border-radius: 4px;
}

/* 调整登录卡片位置，固定在右侧 */
.card-container {
  position: absolute;
  top: 50%;
  right: 5%;
  transform: translateY(-50%);
  padding: 30px;
  max-width: 400px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}
</style>