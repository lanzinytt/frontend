import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/Login.vue';
import RegisterForm from '../components/Register.vue';
import MainHall from '../components/MainHall.vue';
import StudentInfo from '../components/StudentInfo.vue';
import StudentEdit from '../components/StudentEdit.vue';
import StudentInsert from '../components/StudentInsert.vue';
const routes = [
   {
    path: '/',
    name: 'LoginForm',
    component: LoginForm 
}, { 
    path: '/register', name: 'Register', component: RegisterForm 
}, {
    path: '/hall',
    name: 'MainHall',
    component: MainHall 
}, {
    path: '/StudentInfo',
    name: 'StudentInfo',
    component: StudentInfo
}, {
    path: '/insert',
    name: 'StudentInsert',
    component: StudentInsert
}, {
    path: '/edit/:id',
    name: 'StudentEdit',
    component: StudentEdit
}];

export default createRouter({
  history: createWebHistory(),
  routes,
});