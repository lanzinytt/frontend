<template>
  <div class="divCen">
    <h3>{{ msg }}</h3>
    <h4>Student Scores Edit</h4>
    <p class="p-right">
      <router-link to="/StudentInfo" active-class="active">Back to home</router-link>
    </p>
    <table>
      <tbody>
        <tr>
          <th>Id</th>
          <td>
            <input type="text" :value="id" readonly />
          </td>
        </tr>
        <tr>
          <th>Name</th>
          <td>
            <input type="text" v-model="name" />
          </td>
        </tr>
        <tr>
          <th>Gender</th>
          <td>
            <select v-model.number="gender">
              <option :value="null">Select Gender</option>
              <option :value="0">Male</option>
              <option :value="1">Female</option>
            </select>
          </td>
        </tr>
        <tr>
          <th>Chinese</th>
          <td>
            <input type="text" v-model="chinese" ref="chineseInput" />
          </td>
        </tr>
        <tr>
          <th>Math</th>
          <td>
            <input type="text" v-model="math" ref="mathInput" />
          </td>
        </tr>
        <tr>
          <th>English</th>
          <td>
            <input type="text" v-model="english" ref="englishInput" />
          </td>
        </tr>
        <tr>
          <th>Semester</th>
          <td>
            <select v-model.number="semester">
              <option v-for="i in 12" :key="i" :value="i">Semester {{ i }}</option>
            </select>
          </td>
        </tr>
        <tr>
          <th>班级</th>
          <td>
            <select v-model.number="classValue">
              <option :value="0">未知</option>
              <option :value="1">1班</option>
              <option :value="2">2班</option>
              <option :value="3">3班</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
    <p>
      <button @click="btn_edit_stuinfo">Edit to Save</button>
    </p>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: "StudentEdit",
  data() {
    return {
      msg: "Welcome to Student Management App",
      id: "",
      name: "",
      gender: null,
      chinese: "",
      math: "",
      english: "",
      semester: 1, // 新增字段
      classValue: 0 // 新增班级字段
    };
  },
  async created() {
    // 从路由参数中获取学生 ID，并根据 ID 从后端获取学生详细信息
    const stuId = this.$route.params.id;
    try {
      const res = await axios.get(`${process.env.VUE_APP_NODE_API_BASE_URL}/students/${stuId}`);
      const stuInfo = res.data;
      this.id = stuInfo.id;
      this.name = stuInfo.name;
      this.gender = stuInfo.gender; // 这里假设后端存储为 0 或 1
      this.chinese = stuInfo.chinese;
      this.math = stuInfo.math;
      this.english = stuInfo.english;
      this.semester = stuInfo.semester || 1; // 从后端获取学期
      // 对班级字段，若后端返回为空或 0 则显示 0（未知），否则直接赋值
      this.classValue = (typeof stuInfo.class === 'number' && stuInfo.class) ? stuInfo.class : 0;
    } catch (err) {
      console.error(err);
      alert("Failed to load student information!");
      this.$router.push({ path: "/StudentInfo" });
    }
  },
  methods: {
    validateChinese() {
      const chineseInput = this.$refs.chineseInput;
      if (!this.chinese) {
        alert("Chinese score cannot be empty.");
        this.flashInput(chineseInput);
        return false;
      }
      if (this.chinese < 0 || this.chinese > 100) {
        alert("Chinese score must be between 0 and 100.");
        this.flashInput(chineseInput);
        return false;
      }
      return true;
    },
    validateMath() {
      const mathInput = this.$refs.mathInput;
      if (!this.math) {
        alert("Math score cannot be empty.");
        this.flashInput(mathInput);
        return false;
      }
      if (this.math < 0 || this.math > 100) {
        alert("Math score must be between 0 and 100.");
        this.flashInput(mathInput);
        return false;
      }
      return true;
    },
    validateEnglish() {
      const englishInput = this.$refs.englishInput;
      if (!this.english) {
        alert("English score cannot be empty.");
        this.flashInput(englishInput);
        return false;
      }
      if (this.english < 0 || this.english > 100) {
        alert("English score must be between 0 and 100.");
        this.flashInput(englishInput);
        return false;
      }
      return true;
    },
    flashInput(inputElement) {
      if (inputElement) {
        inputElement.style.border = "3px solid lightblue";
        inputElement.focus();
        setTimeout(() => {
          inputElement.style.border = "";
        }, 500);
      }
    },
    async btn_edit_stuinfo() {
      if (this.gender === null) {
        alert("Gender must be selected.");
        return;
      }
      if (!this.validateChinese() || !this.validateMath() || !this.validateEnglish()) {
        return;
      }
      const chinese = parseFloat(this.chinese) || 0;
      const math = parseFloat(this.math) || 0;
      const english = parseFloat(this.english) || 0;
      const sum = chinese + math + english;
      const mean = (sum / 3).toFixed(2);

      // 构建学生数据对象
      const studentData = {
        name: this.name,
        gender: this.gender,
        chinese: this.chinese,
        math: this.math,
        english: this.english,
        sum: sum,
        mean: mean,
        semester: this.semester, // 提交 semester
        class: this.classValue  // 提交班级（整数）
      };

      try {
        // 调用后端 PUT 接口更新学生信息
        await axios.put(`${process.env.VUE_APP_NODE_API_BASE_URL}/students/${this.id}`, studentData);
        alert("Student information updated successfully!");
        this.$router.push({ path: "/StudentInfo" });
      } catch (err) {
        console.error(err);
        alert("Failed to update student information");
      }
    }
  },
};
</script>

<style scoped>
h3, h4 {
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
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

p {
  font-style: normal;
}

p.p-right {
  font-style: italic;
  text-align: right;
  margin: 15px 0;
}

div.divCen {
  max-width: 600px;
  margin: 30px auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  padding: 25px;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  margin: 15px 0;
}

th {
  background-color: #f0f7ff;
  color: #2c3e50;
  font-weight: 600;
  text-align: left;
  padding: 12px 15px;
  border-radius: 6px 0 0 6px;
  width: 30%;
}

td {
  padding: 8px 15px;
}

input, select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

input:focus, select:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66,184,131,0.2);
  outline: none;
}

/* 只读输入框样式 */
input[readonly] {
  background-color: #f8f9fa;
  border-color: #eaeff5;
  color: #777;
}

button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 15px;
  display: block;
  margin: 25px auto 10px;
}

button:hover {
  background-color: #3aa876;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(66,184,131,0.3);
}

button:active {
  transform: translateY(0);
}

a {
  color: #42b983;
  transition: color 0.2s;
}

a:hover {
  color: #3aa876;
  text-decoration: underline;
}
</style>
