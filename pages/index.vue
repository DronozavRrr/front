<template>
    <div class="container mt-5">
      <h1 class="text-center mb-4">Добро пожаловать</h1>
  
      <form @submit.prevent="login" class="mx-auto" style="max-width: 400px;">
        <!-- Выбор сущности -->
        <div class="mb-3">
          <label for="entity" class="form-label">Выберите сущность:</label>
          <select v-model="entity" id="entity" class="form-select">
            <option value="users">Пользователи</option>
            <option value="wallets">Кошельки</option>
            <option value="transactions">Транзакции</option>
            <option value="orders">Ордеры</option>
            <option value="statuses">Статусы</option>
            <option value="cryptocurrencies">Криптовалюты</option>
            <option value="orderhistory">История ордеров</option>
            <option value="cryptorates">Курсы криптовалют</option>
          </select>
        </div>
  
        <!-- Выбор роли -->
        <div class="mb-3">
          <label for="role" class="form-label">Выберите роль:</label>
          <select v-model="role" id="role" class="form-select">
            <option value="Admin">Администратор</option>
            <option value="User">Пользователь</option>
            <option value="Guest">Гость</option>
          </select>
        </div>
  
        <!-- Кнопка входа -->
        <button type="submit" class="btn btn-primary w-100">Войти</button>
      </form>
  
      <!-- Кнопка "О программе" -->
      <div class="text-center mt-4">
        <button @click="about" class="btn btn-info">О программе</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        role: 'Guest', // Выбранная роль
        entity: 'users', // Выбранная сущность
      };
    },
    methods: {
      login() {
        // Сохраняем роль и сущность в локальное хранилище
        localStorage.setItem('role', this.role);
        localStorage.setItem('entity', this.entity);
  
        // Перенаправляем на страницу, соответствующую сущности и роли
        this.$router.push(`/${this.entity}?role=${this.role}`);
      },
      about() {
        this.$router.push(`/about`);
      },
    },
  };
  </script>
  
  <style>
  /* Добавляем небольшой отступ сверху для кнопки "О программе" */
  .btn-info {
    margin-top: 15px;
  }
  </style>
  