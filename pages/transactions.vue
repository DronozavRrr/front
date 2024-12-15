<template>
    <div class="container mt-5">
      <h1 class="text-center mb-4">Панель транзакций</h1>
      <p class="text-center">Просмотр и управление транзакциями.</p>
      <div class="text-center mb-3">
        <button class="btn btn-primary" @click="loadTransactions">Загрузить транзакции</button>
        <button class="btn btn-success" @click="openModal">Добавить транзакцию</button>
        <button class="btn btn-secondary" @click="goBack">Назад</button>
      </div>
      <div v-if="transactions.length" class="table-responsive">
        <h2 class="text-center mb-3">Список транзакций</h2>
        <table class="table table-striped">
          <thead>
            <tr>
              <th @click="sort('transactionid')" class="sortable">
                ID
                <span v-if="sortKey === 'transactionid'" class="sort-icon">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th @click="sort('senderWalletID')" class="sortable">
                Отправитель
                <span v-if="sortKey === 'senderWalletID'" class="sort-icon">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th @click="sort('receiverWalletID')" class="sortable">
                Получатель
                <span v-if="sortKey === 'receiverWalletID'" class="sort-icon">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th @click="sort('amount')" class="sortable">
                Сумма
                <span v-if="sortKey === 'amount'" class="sort-icon">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th @click="sort('fee')" class="sortable">
                Комиссия
                <span v-if="sortKey === 'fee'" class="sort-icon">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th>Статус</th>
              <th @click="sort('time')" class="sortable">
                Время
                <span v-if="sortKey === 'time'" class="sort-icon">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in sortedTransactions" :key="transaction.transactionid">
              <td>{{ transaction.transactionid }}</td>
              <td>{{ transaction.senderWalletID }}</td>
              <td>{{ transaction.receiverWalletID }}</td>
              <td>{{ transaction.amount }}</td>
              <td>{{ transaction.fee }}</td>
              <td>{{ transaction.statusname }}</td>
              <td>{{ transaction.time }}</td>
              <td>
                <button class="btn btn-danger btn-sm" @click="deleteTransaction(transaction.transactionid)">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center">
        <p>Транзакции не найдены</p>
      </div>
  
      <!-- Модальное окно -->
      <div v-if="isModalOpen" class="modal d-block">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Добавить транзакцию</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitForm">
                <div class="mb-3">
                  <label for="senderWalletID" class="form-label">ID отправителя</label>
                  <input type="number" id="senderWalletID" v-model="form.senderWalletID" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label for="receiverWalletID" class="form-label">ID получателя</label>
                  <input type="number" id="receiverWalletID" v-model="form.receiverWalletID" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label for="amount" class="form-label">Сумма</label>
                  <input type="number" id="amount" v-model="form.amount" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label for="fee" class="form-label">Комиссия</label>
                  <input type="number" id="fee" v-model="form.fee" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label for="statusID" class="form-label">ID статуса</label>
                  <input type="number" id="statusID" v-model="form.statusID" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary">Добавить</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  import api from '~/utils/api';
  
  export default {
    setup() {
      const transactions = ref([]);
      const isModalOpen = ref(false);
      const form = ref({
        senderWalletID: '',
        receiverWalletID: '',
        amount: '',
        fee: '',
        statusID: '',
      });
  
      const sortKey = ref('');
      const sortOrder = ref('asc');
  
      const sortedTransactions = computed(() => {
        if (!sortKey.value) return transactions.value;
  
        return [...transactions.value].sort((a, b) => {
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
  
      const loadTransactions = async () => {
        try {
          const role = localStorage.getItem('role') || 'Guest';
          const response = await api.get('/transactions', { params: { role } });
          transactions.value = response.data;
        } catch (error) {
          console.error('Ошибка загрузки транзакций:', error);
        }
      };
  
      const openModal = () => {
        isModalOpen.value = true;
      };
  
      const closeModal = () => {
        isModalOpen.value = false;
      };
  
      const submitForm = async () => {
        try {
          const role = localStorage.getItem('role') || 'Admin';
          await api.post('/transactions', { ...form.value }, { params: { role } });
          closeModal();
          loadTransactions();
        } catch (error) {
          console.error('Ошибка при создании транзакции:', error);
        }
      };
  
      const deleteTransaction = async (transactionID) => {
        try {
          const role = localStorage.getItem('role') || 'Admin';
          await api.delete(`/transactions/${transactionID}`, { params: { role } });
          loadTransactions();
        } catch (error) {
          console.error('Ошибка при удалении транзакции:', error);
        }
      };
  
      const goBack = () => {
        window.history.back();
      };
  
      return {
        transactions,
        sortedTransactions,
        sort,
        sortKey,
        sortOrder,
        isModalOpen,
        form,
        loadTransactions,
        openModal,
        closeModal,
        submitForm,
        deleteTransaction,
        goBack,
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
  .modal.d-block {
    display: block;
    background: rgba(0, 0, 0, 0.5);
  }
  </style>
  