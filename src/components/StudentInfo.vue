<template>
  <div>
    <h3>{{ msg }}</h3>
    <br>
    <h4>Student Scores Table</h4>
    <br>
    <p class="p-right">
      <router-link to="/hall" active-class="active">Back to MainHall</router-link>
    </p>
    <div>
      <label>选择学期：</label>
      <select v-model="selectedSemester" @change="fetchStudents">
        <option value="">全部</option>
        <option v-for="item in semesterOptions" :key="item" :value="item">
          Semester {{ item }}
        </option>
      </select>
      <label style="margin-left:20px;">选择班级：</label>
      <select v-model="selectedClass" @change="fetchStudents">
        <option value="">全部</option>
        <option v-for="item in classOptions" :key="item" :value="item">
          {{ item }}
        </option>
      </select>
    </div>
    <table>
      <tbody>
        <tr>
          <th>No</th>
          <th>姓名</th>
          <th>性别</th>
          <th>Chinese</th>
          <th>Math</th>
          <th>English</th>
          <th>平均分</th>
          <th>总分</th>
          <th>班级</th>
          <th>学期</th>
          <th>Admin</th>
        </tr>
        <tr v-for="(s, index) in stu" :key="s.id">
          <td>{{ index + 1 }}</td>
          <td>{{ s.name }}</td>
          <td>{{ s.gender }}</td>
          <td>{{ s.chinese }}</td>
          <td>{{ s.math }}</td>
          <td>{{ s.english }}</td>
          <td>{{ s.mean }}</td>
          <td>{{ s.sum }}</td>
          <td>{{ s.class || '未知' }}</td>
          <td>{{ s.semester }}</td>
          <td>
            <router-link :to="'/edit/' + s.id" active-class="active">Edit</router-link>
            <a href @click.prevent="del_stu_info(s.id)" active-class="active">Del</a>
          </td>
        </tr>
      </tbody>
    </table>
    <p class="p-right">
      <router-link to="/insert" active-class="active">Insert My grade</router-link>
    </p>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'StudentInfo',
  data() {
    return {
      msg: 'Welcome to Student Management App',
      stu: [],
      selectedSemester: '',
      // 新增对班级的筛选，默认全部
      selectedClass: '',
      // 固定班级选项，也可以使用接口动态获取
      classOptions: ['1班', '2班', '3班', '未知'],
      semesterOptions: Array.from({ length: 12 }, (v, i) => i + 1)
    }
  },
  mounted() {
    this.fetchStudents()
  },
  methods: {
    async fetchStudents() {
      try {
        const params = []
        if (this.selectedSemester) {
          params.push(`semester=${this.selectedSemester}`)
        }
        if (this.selectedClass) {
          params.push(`class=${this.selectedClass}`)
        }
        const query = params.length ? '?' + params.join('&') : ''
        const res = await axios.get(`${process.env.VUE_APP_NODE_API_BASE_URL}/students${query}`)
        this.stu = res.data.map((item) => {
          // 根据后端返回的数据处理性别字段
          if (item.gender && item.gender.data) {
            item.gender = item.gender.data[0] === 1 ? 'Female' : 'Male'
          } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(item.gender)) {
            item.gender = item.gender[0] === 1 ? 'Female' : 'Male'
          } else {
            item.gender = item.gender === 1 ? 'Female' : 'Male'
          }
          const c = parseFloat(item.chinese) || 0
          const m = parseFloat(item.math) || 0
          const e = parseFloat(item.english) || 0
          item.sum = c + m + e
          item.mean = (item.sum / 3).toFixed(2)
          item.class = item.class || '未知'
          item.semester = item.semester || '未知'
          return item
        }).sort((a, b) => b.sum - a.sum)
      } catch (err) {
        console.error(err)
      }
    },
    async del_stu_info(stuId) {
      try {
        await axios.delete(`${process.env.VUE_APP_NODE_API_BASE_URL}/students/${stuId}`)
        this.fetchStudents()
      } catch (err) {
        console.error(err)
      }
    },
  },
}
</script>

<style scoped>
h3, h4 {
  font-weight: 600;
  color: #2c3e50;
}

h3 {
  font-size: 24px;
  margin-bottom: 5px;
}

h4 {
  font-size: 18px;
  color: #647d97;
  margin-bottom: 25px;
}

p.p-right {
  font-style: italic;
  text-align: right;
  margin: 15px 0;
}

/* 筛选区域 */
div:first-of-type {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

label {
  color: #555;
  font-weight: 500;
}

select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  min-width: 150px;
}

/* 表格样式增强 */
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 25px 0;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.06);
}

th {
  background-color: #edf4ff;
  color: #2c3e50;
  font-weight: 600;
  text-align: left;
  padding: 14px 15px;
  border-bottom: 2px solid #d1e4fe;
  white-space: nowrap;
}

td {
  padding: 12px 15px;
  border-bottom: 1px solid #eaeff5;
  white-space: nowrap;
}

tr:nth-child(odd) {
  background-color: #fafbfd;
}

tr:nth-child(even) {
  background-color: #ffffff;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover {
  background-color: #f3f8ff;
}

a {
  color: #42b983;
  transition: color 0.2s;
  text-decoration: none;
  font-weight: 500;
  margin-right: 12px;
  display: inline-block;
}

a:hover {
  color: #3aa876;
  text-decoration: underline;
}

/* 使表格响应式 */
@media (max-width: 1100px) {
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
