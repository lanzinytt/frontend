<template>
  <div class="column">
    <h2 class="column-title">{{ title }}</h2>
    <!-- 横向滚动区域，添加了鼠标拖拽事件 -->
    <div class="column-content" ref="scrollContainer"
         @mousedown="handleMouseDown"
         @mousemove="handleMouseMove"
         @mouseup="handleMouseUp"
         @mouseleave="handleMouseUp">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColumnForm',
  props: {
    title: {
      type: String,
      default: '栏目'
    }
  },
  data() {
    return {
      isDown: false,     // 拖拽状态
      startX: 0,         // 鼠标按下时的 X 坐标
      scrollLeft: 0      // 初始滚动距离
    };
  },
  methods: {
    handleMouseDown(e) {
      this.isDown = true;
      const container = this.$refs.scrollContainer;
      this.startX = e.pageX - container.offsetLeft;
      this.scrollLeft = container.scrollLeft;
    },
    handleMouseMove(e) {
      if (!this.isDown) return;
      e.preventDefault();
      const container = this.$refs.scrollContainer;
      const x = e.pageX - container.offsetLeft;
      const walk = (x - this.startX) * 1; // 拖动灵敏度，可根据实际需求调整
      container.scrollLeft = this.scrollLeft - walk;
    },
    handleMouseUp() {
      this.isDown = false;
    }
  }
};
</script>

<style scoped>
.column {
  margin-bottom: 30px;
}

.column-title {
  margin-bottom: 10px;
  font-size: 1.2em;
  color: #333;
  padding-bottom: 5px;
  border-bottom: 1px solid #ddd;
}

/* 横向滚动区域 */
.column-content {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 10px;
  cursor: grab;
}

.column-content:active {
  cursor: grabbing;
}

/* 自定义滚动条（可选） */
.column-content::-webkit-scrollbar {
  height: 6px;
}

.column-content::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}
</style>