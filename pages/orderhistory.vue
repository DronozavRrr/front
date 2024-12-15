<template>
    <div class="container mt-5">
      <h1 class="text-center mb-4">История ордеров</h1>
      <p class="text-center">Просмотр и управление историей ордеров.</p>
  
      <div class="text-center mb-3">
        <button class="btn btn-primary" @click="loadOrderHistory">Загрузить историю</button>
        <button class="btn btn-success" @click="showCreateModal">Добавить запись</button>
        <button class="btn btn-secondary" @click="goBack">Назад</button>
      </div>
  
      <div v-if="history.length" class="table-responsive">
        <h2 class="text-center mb-3">История ордеров</h2>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID истории</th>
              <th>ID ордера</th>
              <th>Статус</th>
              <th>Время изменения</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in history" :key="entry.historyid">
              <td>{{ entry.historyid }}</td>
              <td>{{ entry.orderid }}</td>
              <td>{{ entry.statusname }}</td>
              <td>{{ entry.time }}</td>
              <td>
                <button class="btn btn-warning btn-sm me-2" @click="showEditModal(entry)">Редактировать</button>
                <button class="btn btn-danger btn-sm" @click="deleteHistoryEntry(entry.historyid)">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center">
        <p>История ордеров не найдена</p>
      </div>
  
      <!-- Модальное окно -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isEditing ? 'Редактировать запись' : 'Добавить запись' }}
              </h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="isEditing ? updateHistoryEntry() : createHistoryEntry()">
                <div class="mb-3">
                  <label for="orderid" class="form-label">ID ордера</label>
                  <input
                    type="number"
                    v-model="currentEntry.orderid"
                    id="orderid"
                    class="form-control"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label for="statusid" class="form-label">ID статуса</label>
                  <input
                    type="number"
                    v-model="currentEntry.statusid"
                    id="statusid"
                    class="form-control"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label for="time" class="form-label">Время</label>
                  <input type="datetime-local" v-model="currentEntry.time" id="time" class="form-control" />
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="closeModal">Отмена</button>
                  <button type="submit" class="btn btn-primary">
                    {{ isEditing ? 'Обновить' : 'Создать' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import api from '~/utils/api';
  
  export default {
    setup() {
      const history = ref([]);
      const currentEntry = ref({ orderid: '', statusid: '', time: '' });
      const isEditing = ref(false);
      const showModal = ref(false);
      const role = localStorage.getItem('role') || 'Guest';
  
      const loadOrderHistory = async () => {
        try {
          const response = await api.get('/orderhistory', { params: { role } });
          history.value = response.data;
        } catch (error) {
          console.error('Ошибка загрузки истории ордеров:', error);
        }
      };
  
      const showCreateModal = () => {
        currentEntry.value = { orderid: '', statusid: '', time: '' };
        isEditing.value = false;
        showModal.value = true;
      };
  
      const createHistoryEntry = async () => {
        try {
          const response = await api.post('/orderhistory', currentEntry.value, { params: { role } });
          history.value.push(response.data);
          closeModal();
        } catch (error) {
          console.error('Ошибка создания записи:', error);
        }
      };
  
      const showEditModal = (entry) => {
        currentEntry.value = { ...entry };
        isEditing.value = true;
        showModal.value = true;
      };
  
      const updateHistoryEntry = async () => {
        try {
          const response = await api.put(`/orderhistory/${currentEntry.value.historyid}`, currentEntry.value, {
            params: { role },
          });
          const index = history.value.findIndex((h) => h.historyid === response.data.historyid);
          history.value[index] = response.data;
          closeModal();
        } catch (error) {
          console.error('Ошибка обновления записи:', error);
        }
      };
  
      const deleteHistoryEntry = async (id) => {
        if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;
  
        try {
          await api.delete(`/orderhistory/${id}`, { params: { role } });
          history.value = history.value.filter((entry) => entry.historyid !== id);
        } catch (error) {
          console.error('Ошибка удаления записи:', error);
        }
      };
  
      const closeModal = () => {
        showModal.value = false;
      };
  
      const goBack = () => {
        window.history.back();
      };
  
      return {
        history,
        currentEntry,
        isEditing,
        showModal,
        loadOrderHistory,
        showCreateModal,
        createHistoryEntry,
        showEditModal,
        updateHistoryEntry,
        deleteHistoryEntry,
        closeModal,
        goBack,
      };
    },
  };
  </script>
  
  <style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
  }
  
  .modal-dialog {
    background: white;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  .modal-content {
    padding: 15px;
  }
  
  .modal-header,
  .modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header {
    border-bottom: 1px solid #ddd;
  }
  
  .modal-footer {
    border-top: 1px solid #ddd;
  }
  </style>
  