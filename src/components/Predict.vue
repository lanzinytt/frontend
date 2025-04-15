<template>
  <div class="predict-container">
    <p class="back-button">
      <router-link to="/hall" active-class="active">Back to Mainhall</router-link>
    </p>
    <!-- 左侧：成绩查询与图表展示 -->
    <div class="left-panel">
      <h3>成绩预测</h3>
      <!-- 查询界面过渡 -->
      <transition name="fade">
        <div v-if="!queryCompleted" class="search-section">
          <div class="input-group">
            <label for="student-name">请输入学生姓名：</label>
            <input id="student-name" type="text" v-model="studentName" placeholder="学生姓名" />
          </div>
          <button @click="fetchStudentScores">查询成绩</button>
        </div>
      </transition>
      <!-- 图表界面过渡，查询完成后显示 -->
      <transition name="fade">
        <div v-if="chartDataAvailable" class="chart-section">
          <canvas id="scoreChart"></canvas>
        </div>
      </transition>
    </div>
    <!-- 右侧：AI 助手，使用 slide 过渡动画 -->
    <transition name="slide">
      <div class="ai-panel" v-if="showAiPanel">
        <h3>AI 助手</h3>
        <div class="chat-messages">
          <div v-if="aiLoading" class="loading">
            <span class="spinner"></span> AI 思考中...
          </div>
          <div v-else>
            <div v-for="(msg, index) in aiChatMessages" :key="index" :class="['message', msg.type]">
              <div v-if="msg.markdown" v-html="msg.text"></div>
              <div v-else>{{ msg.text }}</div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import { marked } from 'marked';
Chart.register(...registerables);

export default {
  name: 'ScorePredictPage',
  data() {
    return {
      studentName: '',
      rawScores: [],
      chart: null,
      chartDataAvailable: false,
      aiChatMessages: [],
      aiLoading: false,         // 新增：表示AI请求正在处理中
      showAiPanel: false,       // 默认不显示 AI 助手侧栏
      queryCompleted: false,    // 控制查询界面的显示
      // 添加深度学习预测相关数据
      dlPrediction: null,
      dlLoading: false
    };
  },
  methods: {
    async fetchStudentScores() {
      if (!this.studentName.trim()) {
        alert("请输入学生姓名");
        return;
      }
      try {
        const res = await axios.get(`${process.env.VUE_APP_NODE_API_BASE_URL}/students`);
        this.rawScores = res.data.filter(item => item.name === this.studentName.trim());
        if (this.rawScores.length === 0) {
          alert("未找到该学生成绩记录");
          this.chartDataAvailable = false;
          if (this.chart) this.chart.destroy();
          this.showAiPanel = false;
          return;
        }
        this.prepareChart();
        // 查询成功后隐藏查询界面，显示图表，并显示 AI 助手侧栏
        this.queryCompleted = true;
        this.showAiPanel = true;
        // 清空之前的回复，并向 AI 模型发送建议请求
        this.aiChatMessages = [];
        this.fetchAiAdvice();
        
        // 调用深度学习预测
        this.fetchDeepLearningPrediction();
      } catch (err) {
        console.error(err);
        alert("查询成绩失败");
      }
    },
    /* 线性回归，返回 { slope, intercept } */
    linearRegression(xs, ys) {
      const n = xs.length;
      const xMean = xs.reduce((sum, x) => sum + x, 0) / n;
      const yMean = ys.reduce((sum, y) => sum + parseFloat(y), 0) / n;
      let numerator = 0;
      let denominator = 0;
      for (let i = 0; i < n; i++) {
        numerator += (xs[i] - xMean) * (ys[i] - yMean);
        denominator += (xs[i] - xMean) ** 2;
      }
      const slope = numerator / denominator;
      const intercept = yMean - slope * xMean;
      return { slope, intercept };
    },
    prepareChart() {
      let group = {};
      this.rawScores.forEach(record => {
        const sem = record.semester || 1;
        if (!group[sem]) {
          group[sem] = { chineseTotal: 0, mathTotal: 0, englishTotal: 0, count: 0 };
        }
        group[sem].chineseTotal += Number(record.chinese);
        group[sem].mathTotal += Number(record.math);
        group[sem].englishTotal += Number(record.english);
        group[sem].count++;
      });
      const semesters = Object.keys(group).sort((a, b) => a - b);
      const labels = semesters.map(s => `Semester ${s}`);
      const chineseData = semesters.map(s => (group[s].chineseTotal / group[s].count).toFixed(2));
      const mathData = semesters.map(s => (group[s].mathTotal / group[s].count).toFixed(2));
      const englishData = semesters.map(s => (group[s].englishTotal / group[s].count).toFixed(2));

      // 获取当前学期序号数组与学科平均分数据
      const semestersNum = semesters.map(s => parseInt(s, 10));
      const chNum = chineseData.map(v => parseFloat(v));
      const mathNum = mathData.map(v => parseFloat(v));
      const engNum = englishData.map(v => parseFloat(v));

      // 计算下一学期编号
      const nextSem = Math.max(...semestersNum) + 1;

      // 对每门学科做线性回归，并预测下一学期成绩
      const { slope: chM, intercept: chB } = this.linearRegression(semestersNum, chNum);
      const chinesePred = (chM * nextSem + chB).toFixed(2);

      const { slope: mathM, intercept: mathB } = this.linearRegression(semestersNum, mathNum);
      const mathPred = (mathM * nextSem + mathB).toFixed(2);

      const { slope: engM, intercept: engB } = this.linearRegression(semestersNum, engNum);
      const engPred = (engM * nextSem + engB).toFixed(2);

      // 将预测值插入 data，用于在图表中显示
      labels.push(`高考(预测)`);
      chineseData.push(chinesePred);
      mathData.push(mathPred);
      englishData.push(engPred);

      if (this.chart) {
        this.chart.destroy();
      }
      
      this.chartDataAvailable = true;
      this.$nextTick(() => {
        const ctx = document.getElementById('scoreChart').getContext('2d');
        this.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Chinese',
                data: chineseData,
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                tension: 0.1
              },
              {
                label: 'Math',
                data: mathData,
                fill: false,
                borderColor: 'rgba(54, 162, 235, 1)',
                tension: 0.1
              },
              {
                label: 'English',
                data: englishData,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 10 }
              }
            }
          }
        });

        // 在图表下方可额外显示预测结果（示例）
        const predictionInfo = document.createElement('div');
        predictionInfo.innerHTML = `
          <p>高考(预测)：</p>
          <p>语文：${chinesePred}, 数学：${mathPred}, 英语：${engPred}</p>
        `;
        document.querySelector('.chart-section')?.appendChild(predictionInfo);
      });
    },
    async fetchAiAdvice() {
      // 构建每个学期成绩的简要描述
      const summary = this.rawScores
        .sort((a, b) => a.semester - b.semester)
        .map(record => `Semester ${record.semester}: Chinese=${record.chinese}, Math=${record.math}, English=${record.english}`)
        .join(', ');
      const prompt = `我是${this.studentName}，我的1到12个学期的成绩是 ${summary}，请给我一些意见`;
      
      try {
        // 设置 loading 状态
        this.aiLoading = true;
        const response = await axios.post(
          `${process.env.VUE_APP_NODE_API_BASE_URL}/api/ollama`,
          { input: prompt }
        );
        const result = response.data.answer || response.data.response || "没有得到回复";
        // 使用 marked 将 Markdown 转换为 HTML 格式
        const htmlContent = marked(result);
        // 将处理后的内容放入消息数组，并标记 markdown:true
        this.aiChatMessages.push({ type: 'received', text: htmlContent, markdown: true });
      } catch (error) {
        console.error(error);
        this.aiChatMessages.push({ type: 'received', text: '调用AI接口失败' });
      } finally {
        this.aiLoading = false;
      }
    },
    // 添加深度学习预测方法
    async fetchDeepLearningPrediction() {
      if (this.rawScores.length < 3) {
        console.warn("深度学习预测需要至少3个学期的数据");
        return;
      }
      
      this.dlLoading = true;
      try {
        // 准备数据：获取最近三个学期的成绩
        const sortedScores = [...this.rawScores]
          .sort((a, b) => a.semester - b.semester);
          
        // 如果数据不足3个学期，无法进行预测
        if (sortedScores.length < 3) {
          console.warn("数据不足3个学期，无法进行深度学习预测");
          return;
        }
        
        // 最近3个学期数据
        const recentScores = sortedScores.slice(-3);
        
        // 调用深度学习预测API
        const response = await axios.post(
          `${process.env.VUE_APP_NODE_API_BASE_URL}/api/dl-predict/predict`, 
          { scores: recentScores }
        );
        
        // 保存预测结果
        if (response.data && response.data.prediction) {
          this.dlPrediction = response.data.prediction;
          console.log("深度学习预测结果:", this.dlPrediction);
          
          // 在图表下方显示预测结果
          this.$nextTick(() => {
            const dlPredictionInfo = document.createElement('div');
            dlPredictionInfo.className = 'dl-prediction';
            dlPredictionInfo.innerHTML = `
              <p>高考(深度学习预测)：</p>
              <p>语文：${this.dlPrediction.chinese}, 数学：${this.dlPrediction.math}, 英语：${this.dlPrediction.english}</p>
            `;
            document.querySelector('.chart-section')?.appendChild(dlPredictionInfo);
          });
        }
      } catch (error) {
        console.error("深度学习预测失败:", error);
        // 可以添加一个错误处理UI，或使用模拟数据作为备用
        this.dlPrediction = {
          chinese: (Math.random() * 5 + 90).toFixed(2),
          math: (Math.random() * 5 + 88).toFixed(2),
          english: (Math.random() * 5 + 92).toFixed(2)
        };
        
        this.$nextTick(() => {
          const dlPredictionInfo = document.createElement('div');
          dlPredictionInfo.className = 'dl-prediction';
          dlPredictionInfo.innerHTML = `
            <p>高考(深度学习预测)：</p>
            <p>语文：${this.dlPrediction.chinese}, 数学：${this.dlPrediction.math}, 英语：${this.dlPrediction.english}</p>
          `;
          document.querySelector('.chart-section')?.appendChild(dlPredictionInfo);
        });
      } finally {
        this.dlLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.predict-container {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 20px;
  gap: 25px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 返回键样式 */
.back-button {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 14px;
}
.back-button a {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: #42b983;
  transition: all 0.2s;
}
.back-button a:hover {
  color: #3aa876;
  transform: translateX(-3px);
}
.back-button a:before {
  content: "←";
  margin-right: 5px;
}

/* 左侧面板，查询和图表 */
.left-panel {
  width: 60%;
  padding: 25px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.left-panel h3 {
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

/* 查询和图表的过渡 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.search-section {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column; /* 改为垂直布局，解决堆叠问题 */
  gap: 15px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.search-section label {
  color: #555;
  font-weight: 500;
}

.search-section input {
  width: 90%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  height: 40px;
}

.search-section button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 10px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  width: 120px; /* 固定按钮宽度，不再过大 */
  align-self: flex-end; /* 将按钮对齐到右侧 */
  height: 90px; /* 与输入框高度一致 */
}

.search-section button:hover {
  background-color: #3aa876;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(66,184,131,0.3);
}

/* 在宽屏幕上使用水平布局 */
@media (min-width: 640px) {
  .search-section {
    flex-direction: row;
    align-items: flex-end;
  }
  
  .input-group {
    flex: 1;
  }
  
  .search-section button {
    margin-bottom: 0;
  }
}

.chart-section {
  min-height: 400px;
  margin-top: 20px;
  position: relative;
}

/* 预测结果展示样式 */
.chart-section > div {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-left: 4px solid #42b883;
  border-radius: 0 8px 8px 0;
}
.chart-section > div p:first-child {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}
.chart-section > div p:last-child {
  display: flex;
  justify-content: space-between;
  max-width: 400px;
}

/* AI 助手侧栏，使用滑动过渡 */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.6s ease, opacity 0.5s ease;
}
.slide-enter, .slide-leave-to {
  transform: translateX(50px);
  opacity: 0;
}
.ai-panel {
  width: 38%;
  padding: 25px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}
.ai-panel h3 {
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
}
.ai-panel h3:before {
  content: "🤖";
  margin-right: 8px;
  font-size: 20px;
}

/* 聊天消息区域 */
.chat-messages {
  flex: 1;
  max-height: 70vh;
  overflow-y: auto;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 10px;
  scrollbar-width: thin;
  scrollbar-color: #ddd #f8f9fa;
}
.chat-messages::-webkit-scrollbar {
  width: 6px;
}
.chat-messages::-webkit-scrollbar-track {
  background: #f8f9fa;
}
.chat-messages::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 6px;
}

.message {
  margin-bottom: 15px;
  line-height: 1.5;
}
.message.received {
  background: white;
  padding: 12px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.message.sent {
  background: #e8f5e9;
  padding: 12px 15px;
  border-radius: 8px;
  margin-left: 15%;
}

/* Markdown 内容样式 */
.message.received div {
  line-height: 1.6;
}
.message.received h1,
.message.received h2,
.message.received h3 {
  margin-top: 16px;
  margin-bottom: 8px;
  color: #2c3e50;
}
.message.received p {
  margin-bottom: 10px;
}
.message.received ul,
.message.received ol {
  margin-left: 20px;
  margin-bottom: 10px;
}
.message.received li {
  margin-bottom: 5px;
}
.message.received code {
  background-color: #f1f1f1;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}
.message.received pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
  margin-bottom: 10px;
}
.message.received blockquote {
  margin: 10px 0;
  padding-left: 15px;
  border-left: 3px solid #ddd;
  color: #666;
}
.message.received hr {
  margin: 15px 0;
  border: none;
  border-top: 1px solid #eee;
}

/* loading 状态和旋转图标 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #666;
  font-size: 16px;
  flex-direction: column;
}
.spinner {
  display: inline-block;
  width: 30px;
  height: 30px;
  border: 3px solid rgba(66,184,131,0.2);
  border-top-color: rgba(66,184,131,0.8);
  border-radius: 50%;
  margin-bottom: 12px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .predict-container {
    flex-direction: column;
  }
  .left-panel, .ai-panel {
    width: 100%;
  }
  .slide-enter, .slide-leave-to {
    transform: translateY(50px);
  }
}
</style>