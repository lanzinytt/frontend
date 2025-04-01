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
            {{ msg.text }}
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
      directoryItems: ['全部', '服务类别 1', '服务类别 2'],
      // 定义多个服务栏目，每个栏目包含服务数组
      columns: [
        {
          title: '服务类别 1',
          services: [
            {
              title: '成绩查询',
              description: '服务A的描述',
              link: '/StudentInfo',
            },
            {
              title: '服务B',
              description: '服务B的描述',
            },
            {
              title: '服务C',
              description: '服务C的描述',
            },
          ],
        },
        {
          title: '服务类别 2',
          services: [
            {
              title: '服务D',
              description: '服务D的描述',
            },
            {
              title: '服务E',
              description: '服务E的描述',
            },
            {
              title: '服务F',
              description: '服务F的描述',
            },
          ],
        },
      ],
      chatMessage: '',
      chatMessages: [
        { type: 'received', text: '你好，有什么可以帮助？' },
        { type: 'sent', text: '我有个问题...' }
      ],
      chatSidebarVisible: false,
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
        this.chatMessages.push({ type: 'sent', text: userMsg });
        this.chatMessage = '';
        // 调用 Ollama
        this.queryOllama(userMsg);
      }
    },
    async queryOllama(message) {
      try {
        const response = await axios.post('http://localhost:3000/api/ollama', { input: message });
        // 尝试读取 answer 属性，如果没有则读取 response 属性
        const result = response.data.answer || response.data.response;
        if (result) {
          this.chatMessages.push({ type: 'received', text: result });
        } else {
          this.chatMessages.push({ type: 'received', text: 'No response from model.' });
        }
      } catch (error) {
        console.error('Ollama error:', error);
        this.chatMessages.push({ type: 'received', text: 'Error connecting to model.' });
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
</style>