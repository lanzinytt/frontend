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
        // 判断是否为绝对URL(以http://或https://开头)
        if (this.link.match(/^(http|https):\/\//)) {
          // 如果是绝对URL，直接在浏览器中打开
          window.open(this.link, '_blank');
        } 
        // 判断是否为机内URI(以/开头或包含特定文件扩展名)
        else if (this.link.startsWith('/') || 
                this.link.endsWith('.html') || 
                this.link.endsWith('.htm') ||
                this.link.includes('/web_class/')) {
          // 直接访问机内URI，而不通过路由
          window.location.href = this.link;
        } 
        else {
          // 其他情况使用Vue Router导航
          this.$router.push(this.link);
        }
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