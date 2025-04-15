<template>
  <div class="main-container">
    <!-- Left Sidebar -->
    <div class="sidebar" :style="{ width: sidebarWidth + 'px' }">
      <div v-if="sidebarExpanded">
        <input type="text" v-model="searchQuery" placeholder="Search" class="search-input" />
        <ul>
          <li v-for="(item, index) in filteredDirectoryItems" :key="index"
              :class="{ active: selectedDirectory === item, empty: (!directoryItemMatch(item) || (directoryCounts[item] || 0) === 0) }"
              @click="selectDirectory(item)">
            <a>{{ item }} ({{ directoryCounts[item] || 0 }})</a>
          </li>
        </ul>
      </div>
      <button @click="toggleSidebar" class="toggle-btn">
        <span v-if="sidebarExpanded">&#x25C0;</span>
        <span v-else>&#x25B6;</span>
      </button>
    </div>
    <!-- Content Area -->
    <div class="content">
      <div v-for="(column, cIndex) in filteredColumns" :key="cIndex">
        <Column :title="column.title">
          <Card v-for="(service, index) in column.services" :key="index" :link="service.link">
            <h3>{{ service.title }}</h3>
            <p>{{ service.description }}</p>
          </Card>
        </Column>
      </div>
    </div>
    <!-- Right Chat Sidebar -->
    <div class="chat-sidebar" :class="{ closed: !chatSidebarVisible }">
      <button @click="toggleChatSidebar" class="chat-toggle-btn">
        <span v-if="chatSidebarVisible">&#x2715;</span>
        <span v-else>&#9993;</span>
      </button>
      <div class="chat-content" v-show="chatSidebarVisible">
        <div class="chat-messages">
          <div v-for="(msg, idx) in chatMessages" :key="idx" :class="['message', msg.type]">
            <!-- 使用 v-html 渲染 Markdown 转换后的 HTML -->
            <div v-if="msg.markdown" v-html="msg.text"></div>
            <!-- 纯文本消息保持原样 -->
            <div v-else>{{ msg.text }}</div>
          </div>
          <!-- 添加加载指示器 -->
          <div v-if="aiLoading" class="message loading">
            <span class="spinner"></span> AI 思考中...
          </div>
        </div>
        <div class="chat-input">
          <textarea v-model="chatMessage" placeholder="Type..." @keyup.enter.exact="sendMessage"></textarea>
          <br/>
          <button @click="sendMessage">&#10148;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Column from './Column.vue';
import Card from './Card.vue';
// 引入 marked 库用于 Markdown 转换
import { marked } from 'marked';

export default {
  name: 'MainHall',
  components: {
    Column,
    Card,
  },
  data() {
    return {
      sidebarWidth: 50, // 默认侧栏宽度（展开状态）
      sidebarExpanded: false,
      searchQuery: '',
      selectedDirectory: '全部',
      // 目录项：增加 “全部” 选项，其余目录项与栏目标题对应
      directoryItems: ['全部', '学业', '文娱'],
      // 定义多个服务栏目，每个栏目包含服务数组
      columns: [
        {
          title: '学业',
          services: [
            {
              title: '成绩查询',
              description: '不嘻嘻',
              link: '/StudentInfo',
            },
            {
              title: '成绩预测',
              description: '基于deepsleep的超绝AI预测',
              link: '/Predict'
            },
            {
              title: '学期清理申办',
              description: '你真的想点吗',
            },
            {
              title: '个人blog托管',
              description: '不咯个',
              link:'/blog/index.html'
            },
          ],
        },
        {
          title: '文娱',
          services: [
            {
              title: '缘神',
              description: '世纪情缘联谊',
              link:'/marry/index.html'
            },
            {
              title: '黑水河畔',
              description: '=……=^',
              link:"https://bbs.uestc.edu.cn/"
            },
            {
              title: '校园集市',
              description: '😘',
              link:"https://xiaoyuanjishi.com/"
            },
          ],
        },
      ],
      chatMessage: '',
      chatMessages: [
        { type: 'received', text: '你好，有什么可以帮助？', markdown: false },
        { type: 'sent', text: '我有个问题...', markdown: false }
      ],
      chatSidebarVisible: false,
      aiLoading: false, // 添加AI加载状态
    };
  },
  computed: {
    // 原 filteredDirectoryItems 修改为：
    filteredDirectoryItems() {
      return this.directoryItems;
    },
    // 计算在当前搜索条件下，每个目录项对应的服务数量
    directoryCounts() {
      let counts = {};
      let total = 0;
      this.columns.forEach((column) => {
        // 筛选该栏目下符合搜索条件的服务
        const matchingServices = column.services.filter((service) => {
          if (!this.searchQuery) return true;
          const q = this.searchQuery.toLowerCase();
          return (
            service.title.toLowerCase().includes(q) ||
            (service.description && service.description.toLowerCase().includes(q))
          );
        });
        counts[column.title] = matchingServices.length;
        total += matchingServices.length;
      });
      counts['全部'] = total;
      return counts;
    },
    // 根据选中的目录项过滤服务栏目，并进一步过滤每个栏目中的服务
    filteredColumns() {
      // 定义服务过滤条件
      const filterServices = (services) => {
        if (!this.searchQuery) return services;
        return services.filter((service) => {
          const q = this.searchQuery.toLowerCase();
          return (
            service.title.toLowerCase().includes(q) ||
            (service.description && service.description.toLowerCase().includes(q))
          );
        });
      };
      if (this.selectedDirectory === '全部') {
        return this.columns.map((column) => ({
          ...column,
          services: filterServices(column.services),
        }));
      } else {
        return this.columns
          .filter((column) => column.title === this.selectedDirectory)
          .map((column) => ({
            ...column,
            services: filterServices(column.services),
          }));
      }
    },
  },
  methods: {
    // 新增，用于判断目录项是否匹配搜索条件
    directoryItemMatch(item) {
      if (!this.searchQuery) return true;
      return item.toLowerCase().includes(this.searchQuery.toLowerCase());
    },
    selectDirectory(item) {
      this.selectedDirectory = item;
    },
    toggleSidebar() {
      if (this.sidebarExpanded) {
        this.sidebarWidth = 50;
      } else {
        this.sidebarWidth = 200;
      }
      this.sidebarExpanded = !this.sidebarExpanded;
    },
    sendMessage() {
      if (this.chatMessage.trim()) {
        const userMsg = this.chatMessage;
        // 发送的消息不需要Markdown渲染
        this.chatMessages.push({ type: 'sent', text: userMsg, markdown: false });
        this.chatMessage = '';
        
        // 调用 Ollama 前显示加载状态
        this.aiLoading = true;
        
        // 调用 Ollama
        this.queryOllama(userMsg);
      }
    },
    async queryOllama(message) {
      try {
        const response = await axios.post('http://localhost:3000/api/ollama', { input: message });
        // 尝试读取 answer 属性，如果没有则读取 response 属性
        const result = response.data.answer || response.data.response;
        // 使用 marked 将 Markdown 转换为 HTML 格式
        const htmlContent = marked(result);
        
        // 将处理后的内容放入消息数组，并标记 markdown:true
        this.chatMessages.push({ 
          type: 'received', 
          text: htmlContent, 
          markdown: true 
        });
      } catch (error) {
        console.error('Ollama error:', error);
        this.chatMessages.push({ 
          type: 'received', 
          text: '调用AI接口失败', 
          markdown: false 
        });
      } finally {
        // 无论成功失败都关闭加载状态
        this.aiLoading = false;
      }
    },
    toggleChatSidebar() {
      this.chatSidebarVisible = !this.chatSidebarVisible;
    },
  },
};
</script>

<style scoped>
.main-container {
  display: flex;
  height: 100vh;
  background: #fafafa;
  font-family: sans-serif;
}

/* Left Sidebar */
.sidebar {
  background: #fff;
  border-right: 1px solid #ccc;
  transition: width 0.3s ease;
  padding: 10px;
  position: relative;
}
.search-input {
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar li {
  margin: 8px 0;
  cursor: pointer;
  font-size: 14px;
}
.sidebar li.active a {
  font-weight: bold;
}
.sidebar li.empty a {
  color: #bbb;
  opacity: 0.6;
}
.sidebar a {
  color: #333;
  text-decoration: none;
}
.toggle-btn {
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
}

/* Content Area */
.content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

/* Right Chat Sidebar */
.chat-sidebar {
  width: 200px;
  background: #fff;
  border-left: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  padding: 10px;
  transition: width 0.3s ease; /* 添加过渡效果 */
}
.chat-sidebar.closed {
  width: 40px; /* 收起时宽度 */
}
.chat-toggle-btn {
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  margin-bottom: 10px;
}
.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
}
.message {
  margin: 4px 0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.message.received {
  background: #f0f0f0;
  align-self: flex-start;
}
.message.sent {
  background: #e0f7dd;
  align-self: flex-end;
}
.message.loading {
  background: #f0f0f0;
  align-self: center;
  display: flex;
  align-items: center;
}
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ccc;
  border-top: 2px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.chat-input {
  display: flex;
  flex-direction: column;
}
.chat-input input {
  flex: 1;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
}
.chat-input button {
  margin-top: 2px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-left: none;
  background: #ccc;
  color: #333;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 12px;
}
.chat-input textarea {
  width: 100%;
  padding: 4px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow-y: auto;
  resize: vertical;
  min-height: 30px;
  max-height: 100px; /* 根据需要设置上限 */
  box-sizing: border-box;
}

/* 为Markdown内容添加样式 */
.message :deep(h1), 
.message :deep(h2), 
.message :deep(h3), 
.message :deep(h4) {
  margin-top: 8px;
  margin-bottom: 4px;
  font-weight: bold;
}

.message :deep(h1) { font-size: 16px; }
.message :deep(h2) { font-size: 15px; }
.message :deep(h3) { font-size: 14px; }
.message :deep(h4) { font-size: 13px; }

.message :deep(p) {
  margin: 5px 0;
}

.message :deep(code) {
  padding: 1px 3px;
  background-color: #f5f5f5;
  border-radius: 3px;
  font-family: monospace;
  font-size: 11px;
}

.message :deep(pre) {
  background-color: #f5f5f5;
}
</style>