<template>
  <div class="card" @click="handleClick">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'CardForm',
  props: {
    // 如果传入 link，则点击该卡片会跳转到相应路由
    link: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleClick() {
      if (this.link) {
        this.$router.push(this.link);
      }
    }
  }
};
</script>

<style scoped>
.card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
  transition: transform 0.3s ease, background-color 0.3s ease;
  cursor: pointer; /* 显示手型光标 */
}

.card:hover {
  transform: scale(1.05);
  background-color: #e0f7ff;
}
</style>