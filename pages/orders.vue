<template>
    <div class="container mt-5">
      <h1 class="text-center mb-4">Панель ордеров</h1>
      <p class="text-center">Просмотр и управление ордерами.</p>
      <div class="text-center mb-3">
        <button class="btn btn-primary" @click="loadOrders">Загрузить ордера</button>
        <button class="btn btn-success" @click="showCreateForm">Добавить ордер</button>
        <button class="btn btn-secondary" @click="goBack">Назад</button>
      </div>
  
      <!-- Форма для создания/редактирования ордера -->
      <div v-if="showForm" class="mb-5">
        <h3 class="text-center">{{ editingOrder ? 'Редактировать ордер' : 'Создать ордер' }}</h3>
        <form @submit.prevent="saveOrder">
          <div class="mb-3">
            <label class="form-label">Пользователь ID:</label>
            <input v-model="orderData.userID" type="number" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Криптовалюта ID:</label>
            <input v-model="orderData.cryptoID" type="number" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Тип:</label>
            <select v-model="orderData.type" class="form-select" required>
              <option value="Buy">Покупка</option>
              <option value="Sell">Продажа</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Количество:</label>
            <input v-model="orderData.amount" type="number" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Цена:</label>
            <input v-model="orderData.price" type="number" class="form-control" required />
          </div>
          <button class="btn btn-primary" type="submit">{{ editingOrder ? 'Обновить' : 'Создать' }}</button>
          <button class="btn btn-secondary" @click="cancelForm">Отмена</button>
        </form>
      </div>
  
      <!-- Таблица ордеров -->
      <div v-if="sortedOrders.length" class="table-responsive">
        <h2 class="text-center mb-3">Список ордеров</h2>
        <table class="table table-striped">
          <thead>
            <tr>
              <th @click="sort('orderid')" class="sortable">ID <span v-if="sortKey === 'orderid'" class="sort-icon">{{ sortOrder }}</span></th>
              <th @click="sort('username')" class="sortable">Пользователь <span v-if="sortKey === 'username'" class="sort-icon">{{ sortOrder }}</span></th>
              <th @click="sort('cryptoname')" class="sortable">Криптовалюта <span v-if="sortKey === 'cryptoname'" class="sort-icon">{{ sortOrder }}</span></th>
              <th>Тип</th>
              <th @click="sort('amount')" class="sortable">Количество <span v-if="sortKey === 'amount'" class="sort-icon">{{ sortOrder }}</span></th>
              <th @click="sort('price')" class="sortable">Цена <span v-if="sortKey === 'price'" class="sort-icon">{{ sortOrder }}</span></th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in sortedOrders" :key="order.orderid">
              <td>{{ order.orderid }}</td>
              <td>{{ order.username }}</td>
              <td>{{ order.cryptoname }}</td>
              <td>{{ order.type }}</td>
              <td>{{ order.amount }}</td>
              <td>{{ order.price }}</td>
              <td>{{ order.statusname }}</td>
              <td>
                <button class="btn btn-warning btn-sm" @click="editOrder(order)">Редактировать</button>
                <button class="btn btn-danger btn-sm" @click="deleteOrder(order.orderid)">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center">
        <p>Ордера не найдены</p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  import api from '~/utils/api';
  
  export default {
    setup() {
      const orders = ref([]);
      const sortKey = ref('');
      const sortOrder = ref('asc');
      const showForm = ref(false);
      const editingOrder = ref(false);
      const orderData = ref({
        userID: '',
        cryptoID: '',
        type: 'Buy',
        amount: '',
        price: '',
      });
  
      const sortedOrders = computed(() => {
        if (!sortKey.value) return orders.value;
        return [...orders.value].sort((a, b) => {
          if (a[sortKey.value] < b[sortKey.value]) return sortOrder.value === 'asc' ? -1 : 1;
          if (a[sortKey.value] > b[sortKey.value]) return sortOrder.value === 'asc' ? 1 : -1;
          return 0;
        });
      });
  
      const sort = (key) => {
        if (sortKey.value === key) {
          sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
        } else {
          sortKey.value = key;
          sortOrder.value = 'asc';
        }
      };
  
      const loadOrders = async () => {
        try {
          const role = localStorage.getItem('role') || 'Guest';
          const response = await api.get('/orders', { params: { role } });
          orders.value = response.data;
        } catch (error) {
          console.error('Ошибка загрузки ордеров:', error);
        }
      };
  
      const showCreateForm = () => {
        showForm.value = true;
        editingOrder.value = false;
        orderData.value = { userID: '', cryptoID: '', type: 'Buy', amount: '', price: '' };
      };
  
      const editOrder = (order) => {
        showForm.value = true;
        editingOrder.value = true;
        orderData.value = { ...order };
      };
  
      const saveOrder = async () => {
        try {
          const role = localStorage.getItem('role') || 'Admin';
          if (editingOrder.value) {
            await api.put(`/orders/${orderData.value.orderid}/update`, orderData.value, { params: { role } });
          } else {
            await api.post('/orders/create', orderData.value, { params: { role } });
          }
          loadOrders();
          showForm.value = false;
        } catch (error) {
          console.error('Ошибка сохранения ордера:', error);
        }
      };
  
      const deleteOrder = async (id) => {
        try {
          const role = localStorage.getItem('role') || 'Admin';
          await api.delete(`/orders/${id}`, { params: { role } });
          loadOrders();
        } catch (error) {
          console.error('Ошибка удаления ордера:', error);
        }
      };
  
      const goBack = () => {
        window.history.back();
      };
  
      const cancelForm = () => {
        showForm.value = false;
      };
  
      return {
        orders,
        sortedOrders,
        sort,
        sortKey,
        sortOrder,
        loadOrders,
        showForm,
        editingOrder,
        orderData,
        showCreateForm,
        editOrder,
        saveOrder,
        deleteOrder,
        goBack,
        cancelForm,
      };
    },
  };
  </script>
  
  <style>
  .sortable {
    cursor: pointer;
    user-select: none;
  }
  
  .sort-icon {
    margin-left: 5px;
    font-size: 0.8rem;
  }
  </style>
  