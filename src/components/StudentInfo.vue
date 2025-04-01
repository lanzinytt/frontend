<template>
  <div>
    <h3>{{ msg }}</h3>
    <h4>Student Scores Table</h4>
    <p class="p-right">
      <router-link to="/hall" active-class="active">Back to MainHall</router-link>
    </p>
    <table>
      <tbody>
      <tr>
        <th>No</th>
        <th>Id</th>
        <th>Name</th>
        <th>Gender</th>
        <th>Chinese</th>
        <th>Math</th>
        <th>English</th>
        <th>Mean</th>
        <th>Sum</th>
        <th>Admin</th>
      </tr>
      <tr v-for="(s, index) in stu" :key="s.id">
        <td>{{ index + 1 }}</td>
        <td>{{ s.id }}</td>
        <td>{{ s.name }}</td>
        <td>{{ s.gender }}</td>
        <td>{{ s.chinese }}</td>
        <td>{{ s.math }}</td>
        <td>{{ s.english }}</td>
        <td>{{ s.mean }}</td>
        <td>{{ s.sum }}</td>
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
      stu: [], // 存储后端返回的学生信息
    }
  },
  mounted() {
    this.fetchStudents()
  },
  methods: {
    async fetchStudents() {
      try {
        const res = await axios.get(`${process.env.VUE_APP_NODE_API_BASE_URL}/students`)
        this.stu = res.data.map((item) => {
          // 如果 item.gender 有 data 属性，则转换
          if (item.gender && item.gender.data) {
            item.gender = item.gender.data[0] === 1 ? 'Female' : 'Male'
          } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(item.gender)) {
            // 仅在 Buffer 存在时执行此分支
            item.gender = item.gender[0] === 1 ? 'Female' : 'Male'
          } else {
            // 如果以上都不满足，则按数字值判断（假设 item.gender 为 0 或 1）
            item.gender = item.gender === 1 ? 'Female' : 'Male'
          }
          const c = parseFloat(item.chinese) || 0
          const m = parseFloat(item.math) || 0
          const e = parseFloat(item.english) || 0
          item.sum = c + m + e
          item.mean = (item.sum / 3).toFixed(2)
          return item
        }).sort((a, b) => b.sum - a.sum)
      } catch (err) {
        console.error(err)
      }
    },
    async del_stu_info(stuId) {
      try {
        await axios.delete(`${process.env.VUE_APP_NODE_API_BASE_URL}/students/${stuId}`)
        // 删除后重新拉取最新列表
        this.fetchStudents()
      } catch (err) {
        console.error(err)
      }
    },
  },
}
</script>

<style scoped>
h3,
h4 {
  font-weight: normal;
}
p.p-right {
  font-style: italic;
  text-align: right;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
  margin-right: 20px;
}
table {
  width: 98%;
  margin: 16px 0;
  border-collapse: collapse;
  border: 0;
}
th {
  background-color: #93daff;
  color: #000000;
}
th,
td {
  font-size: 0.95em;
  text-align: center;
  padding: 4px;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #c1e9fe;
  border-width: 1px 0 1px 0;
}
tr {
  border: 1px solid #c1e9fe;
}
tr:nth-child(odd) {
  background-color: #dbf2fe;
}
tr:nth-child(even) {
  background-color: #fdfdfd;
}
</style>
