<template>
  <div class="register-wrapper">
    <!-- 轮播背景 -->
    <div class="slideshow"></div>

    <!-- 作者文案 -->
    <div class="author-credit">{{ 'Author：' + authors[currentAuthorIndex] }}</div>

    <!-- 注册表单 -->
    <div class="card-container">
      <h1>用户注册</h1>
      <form @submit.prevent="handleRegister">
        <label for="username">用户名:</label>
        <input id="username" v-model="username" type="text" required />

        <label for="password">密码:</label>
        <input id="password" v-model="password" type="password" required />

        <button type="submit">注册</button>
      </form>
      <p>
         注册完了？
        <router-link to="/">返回</router-link>
      </p>
    </div>
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
      authors: ['ﾍﾅﾁｮｺ', 'NEKO♨', '训林', 'c7肘'],
      currentAuthorIndex: 0
    };
  },
  mounted() {
    setInterval(() => {
      this.currentAuthorIndex = (this.currentAuthorIndex + 1) % this.authors.length;
    }, 5000);
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
        alert('注册失败，请重试');
      }
    },
  },
};
</script>

<style scoped>

.register-wrapper {
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
  background-size: cover;
  animation: slideShow 15s infinite;
  z-index: -1;
}

/* 渐变切换4幅背景，可根据需要调整时间与帧分配 */
@keyframes slideShow {
  0%   { background: url('@/assets/bg1.jpg') center center no-repeat; background-size: cover; }
  25%  { background: url('@/assets/bg2.jpg') center center no-repeat; background-size: cover; }
  50%  { background: url('@/assets/bg3.jpg') center center no-repeat; background-size: cover; }
  75%  { background: url('@/assets/bg4.jpg') center center no-repeat; background-size: cover; }
  100% { background: url('@/assets/bg1.jpg') center center no-repeat; background-size: cover; }
}

/* 作者文案，添加半透明灰底、白字 */
.author-credit {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: #fff;
  font-size: 14px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
  border-radius: 4px;
}

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