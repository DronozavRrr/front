<template>
    <nav class="navbar">
      <ul>
        <li><NuxtLink to="/">Главная</NuxtLink></li>
        <li><NuxtLink to="/about">О программе</NuxtLink></li>
        <li v-if="role === 'Admin'"><NuxtLink to="/admin">Администратор</NuxtLink></li>
        <li v-if="role === 'User'"><NuxtLink to="/user">Пользователь</NuxtLink></li>
        <li v-if="role === 'Guest'"><NuxtLink to="/guest">Гость</NuxtLink></li>
        <li><button @click="logout">Выход</button></li>
      </ul>
    </nav>
  </template>
  
  <script>
  export default {
    data() {
      return {
        role: null, // Получаем роль из состояния приложения
      };
    },
    mounted() {
      this.role = localStorage.getItem('role'); // Читаем роль из локального хранилища
    },
    methods: {
      logout() {
        localStorage.removeItem('role');
        this.$router.push('/'); // Перенаправляем на страницу входа
      },
    },
  };
  </script>
  
  <style>
  .navbar ul {
    display: flex;
    list-style: none;
    padding: 0;
  }
  
  .navbar ul li {
    margin: 0 10px;
  }
  </style>
  