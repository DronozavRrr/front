<template>
    <div class="container mt-5">
      <h1 class="text-center mb-4">Журнал ошибок</h1>
      <p class="text-center">Просмотр последних ошибок в системе.</p>
  
      <div class="text-center mb-3">
        <button class="btn btn-primary" @click="loadErrorLogs">Загрузить журнал</button>
        <button class="btn btn-secondary" @click="goBack">Назад</button>
      </div>
  
      <div v-if="errors.length" class="table-responsive">
        <h2 class="text-center mb-3">Ошибки</h2>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Сообщение</th>
              <th>Время</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="error in errors" :key="error.errorid">
              <td>{{ error.errorid }}</td>
              <td>{{ error.message }}</td>
              <td>{{ error.logtime }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center">
        <p>Ошибки не найдены</p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import api from '~/utils/api';
  
  export default {
    setup() {
      const errors = ref([]);
  
      const loadErrorLogs = async () => {
        try {
          const response = await api.get('/errorlogs');
          errors.value = response.data;
        } catch (error) {
          console.error('Ошибка загрузки журнала ошибок:', error);
        }
      };
  
      const goBack = () => {
        window.history.back();
      };
  
      return {
        errors,
        loadErrorLogs,
        goBack,
      };
    },
  };
  </script>
  