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
      english: ""
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
        mean: mean
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
h3,
h4 {
  font-weight: normal;
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
}
input {
  width: 128px;
}
p {
  font-style: normal;
}
p.p-right {
  font-style: italic;
  text-align: right;
}
div.divCen {
  margin: 2px auto;
  width: auto;
}
table {
  width: 60%;
  margin: auto;
  border-collapse: collapse;
  border: 0;
  text-align: center;
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
