<template>
    <div class="container mt-5">
      <h1 class="text-center mb-4">Панель статусов</h1>
      <p class="text-center">Просмотр и управление статусами.</p>
  
      <div class="text-center mb-3">
        <button class="btn btn-primary" @click="loadStatuses">Загрузить статусы</button>
        <button class="btn btn-success" @click="showCreateModal">Добавить статус</button>
        <button class="btn btn-secondary" @click="goBack">Назад</button>
      </div>
  
      <!-- Таблица статусов -->
      <div v-if="statuses.length" class="table-responsive">
        <h2 class="text-center mb-3">Список статусов</h2>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Описание</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="status in statuses" :key="status.statusid">
              <td>{{ status.statusid }}</td>
              <td>{{ status.name }}</td>
              <td>{{ status.description }}</td>
              <td>
                <button class="btn btn-warning btn-sm me-2" @click="showEditModal(status)">Редактировать</button>
                <button class="btn btn-danger btn-sm" @click="deleteStatus(status.statusid)">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center">
        <p>Статусы не найдены</p>
      </div>
  
      <!-- Модальное окно для добавления/редактирования -->
      <div class="modal fade" id="statusModal" tabindex="-1" aria-labelledby="statusModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="statusModalLabel">{{ isEditing ? 'Редактировать статус' : 'Добавить статус' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="isEditing ? updateStatus() : createStatus()">
                <div class="mb-3">
                  <label for="name" class="form-label">Название</label>
                  <input type="text" v-model="currentStatus.name" id="name" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label for="description" class="form-label">Описание</label>
                  <textarea v-model="currentStatus.description" id="description" class="form-control" required></textarea>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                  <button type="submit" class="btn btn-primary">{{ isEditing ? 'Обновить' : 'Создать' }}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import api from '~/utils/api';
  import { Modal } from 'bootstrap';
  
  export default {
    setup() {
      const statuses = ref([]);
      const currentStatus = ref({ name: '', description: '' });
      const isEditing = ref(false);
      const role = localStorage.getItem('role') || 'Guest';
      let modalInstance = null;
  
      // Загрузка статусов
      const loadStatuses = async () => {
        try {
          const response = await api.get('/statuses', { params: { role } });
          statuses.value = response.data;
        } catch (error) {
          console.error('Ошибка загрузки статусов:', error);
        }
      };
  
      // Показ модального окна для создания
      const showCreateModal = () => {
        currentStatus.value = { name: '', description: '' };
        isEditing.value = false;
        modalInstance.show();
      };
  
      // Создание статуса
      const createStatus = async () => {
        try {
          const response = await api.post('/statuses', currentStatus.value, { params: { role } });
          statuses.value.push(response.data);
          modalInstance.hide();
        } catch (error) {
          console.error('Ошибка создания статуса:', error);
        }
      };
  
      // Показ модального окна для редактирования
      const showEditModal = (status) => {
        currentStatus.value = { ...status };
        isEditing.value = true;
        modalInstance.show();
      };
  
      // Обновление статуса
      const updateStatus = async () => {
        try {
          const response = await api.put(`/statuses/${currentStatus.value.statusid}`, currentStatus.value, {
            params: { role },
          });
          const index = statuses.value.findIndex((s) => s.statusid === response.data.statusid);
          statuses.value[index] = response.data;
          modalInstance.hide();
        } catch (error) {
          console.error('Ошибка обновления статуса:', error);
        }
      };
  
      // Удаление статуса
      const deleteStatus = async (id) => {
        if (!confirm('Вы уверены, что хотите удалить этот статус?')) return;
  
        try {
          await api.delete(`/statuses/${id}`, { params: { role } });
          statuses.value = statuses.value.filter((status) => status.statusid !== id);
        } catch (error) {
          console.error('Ошибка удаления статуса:', error);
        }
      };
  
      // Возврат на предыдущую страницу
      const goBack = () => {
        window.history.back();
      };
  
      // Инициализация модального окна
      onMounted(() => {
        const modalElement = document.getElementById('statusModal');
        modalInstance = new Modal(modalElement);
      });
  
      return {
        statuses,
        currentStatus,
        isEditing,
        loadStatuses,
        showCreateModal,
        createStatus,
        showEditModal,
        updateStatus,
        deleteStatus,
        goBack,
      };
    },
  };
  </script>
  