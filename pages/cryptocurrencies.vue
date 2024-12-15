<template>
    <div class="container mt-5">
      <h1 class="text-center mb-4">Панель криптовалют</h1>
      <p class="text-center">Просмотр и управление криптовалютами.</p>
  
      <div class="text-center mb-3">
        <button class="btn btn-primary" @click="loadCryptocurrencies">Загрузить криптовалюты</button>
        <button class="btn btn-success" @click="openCreateModal">Добавить криптовалюту</button>
        <button class="btn btn-secondary" @click="goBack">Назад</button>
      </div>
  
      <div v-if="sortedCryptocurrencies.length" class="table-responsive">
        <h2 class="text-center mb-3">Список криптовалют</h2>
        <table class="table table-striped">
          <thead>
            <tr>
              <th @click="sort('cryptoid')" class="sortable">ID <span v-if="sortKey === 'cryptoid'">{{ sortOrder }}</span></th>
              <th @click="sort('name')" class="sortable">Название <span v-if="sortKey === 'name'">{{ sortOrder }}</span></th>
              <th @click="sort('symbol')" class="sortable">Символ <span v-if="sortKey === 'symbol'">{{ sortOrder }}</span></th>
              <th @click="sort('marketcap')" class="sortable">Рыночная капитализация <span v-if="sortKey === 'marketcap'">{{ sortOrder }}</span></th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="crypto in sortedCryptocurrencies" :key="crypto.cryptoid">
              <td>{{ crypto.cryptoid }}</td>
              <td>{{ crypto.name }}</td>
              <td>{{ crypto.symbol }}</td>
              <td>{{ crypto.marketcap }}</td>
              <td>
                <button class="btn btn-warning btn-sm" @click="openEditModal(crypto)">Редактировать</button>
                <button class="btn btn-danger btn-sm" @click="deleteCryptocurrency(crypto.cryptoid)">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center">
        <p>Криптовалюты не найдены</p>
      </div>
  
      <!-- Модальное окно -->
      <div v-if="isModalOpen" class="modal-backdrop">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? 'Редактировать криптовалюту' : 'Добавить криптовалюту' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="isEditing ? updateCryptocurrency() : createCryptocurrency()">
              <div class="mb-3">
                <label for="name" class="form-label">Название</label>
                <input
                  type="text"
                  v-model="currentCrypto.name"
                  id="name"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="symbol" class="form-label">Символ</label>
                <input
                  type="text"
                  v-model="currentCrypto.symbol"
                  id="symbol"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="marketcap" class="form-label">Рыночная капитализация</label>
                <input
                  type="number"
                  v-model="currentCrypto.marketcap"
                  id="marketcap"
                  class="form-control"
                  required
                />
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
  </template>
  
  <script>
  import { ref, computed } from "vue";
  import api from "~/utils/api";
  
  export default {
    setup() {
      const cryptocurrencies = ref([]);
      const sortKey = ref("");
      const sortOrder = ref("asc");
      const currentCrypto = ref({ name: "", symbol: "", marketcap: "" });
      const isEditing = ref(false);
      const isModalOpen = ref(false);
      const role = localStorage.getItem("role") || "Guest";
  
      const sortedCryptocurrencies = computed(() => {
        if (!sortKey.value) return cryptocurrencies.value;
        return [...cryptocurrencies.value].sort((a, b) => {
          if (a[sortKey.value] < b[sortKey.value]) return sortOrder.value === "asc" ? -1 : 1;
          if (a[sortKey.value] > b[sortKey.value]) return sortOrder.value === "asc" ? 1 : -1;
          return 0;
        });
      });
  
      const sort = (key) => {
        if (sortKey.value === key) {
          sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
        } else {
          sortKey.value = key;
          sortOrder.value = "asc";
        }
      };
  
      const loadCryptocurrencies = async () => {
        try {
          const response = await api.get("/cryptocurrencies", { params: { role } });
          cryptocurrencies.value = response.data;
        } catch (error) {
          console.error("Ошибка загрузки криптовалют:", error);
        }
      };
  
      const openCreateModal = () => {
        currentCrypto.value = { name: "", symbol: "", marketcap: "" };
        isEditing.value = false;
        isModalOpen.value = true;
      };
  
      const createCryptocurrency = async () => {
        try {
          const response = await api.post("/cryptocurrencies", currentCrypto.value, { params: { role } });
          cryptocurrencies.value.push(response.data);
          closeModal();
        } catch (error) {
          console.error("Ошибка создания криптовалюты:", error);
        }
      };
  
      const openEditModal = (crypto) => {
        currentCrypto.value = { ...crypto };
        isEditing.value = true;
        isModalOpen.value = true;
      };
  
      const updateCryptocurrency = async () => {
        try {
          const response = await api.put(`/cryptocurrencies/${currentCrypto.value.cryptoid}`, currentCrypto.value, {
            params: { role },
          });
          const index = cryptocurrencies.value.findIndex((c) => c.cryptoid === response.data.cryptoid);
          cryptocurrencies.value[index] = response.data;
          closeModal();
        } catch (error) {
          console.error("Ошибка обновления криптовалюты:", error);
        }
      };
  
      const deleteCryptocurrency = async (id) => {
        if (!confirm("Вы уверены, что хотите удалить эту криптовалюту?")) return;
  
        try {
          await api.delete(`/cryptocurrencies/${id}`, { params: { role } });
          cryptocurrencies.value = cryptocurrencies.value.filter((crypto) => crypto.cryptoid !== id);
        } catch (error) {
          console.error("Ошибка удаления криптовалюты:", error);
        }
      };
  
      const closeModal = () => {
        isModalOpen.value = false;
      };
  
      const goBack = () => {
        window.history.back();
      };
  
      return {
        cryptocurrencies,
        currentCrypto,
        sort,
        sortKey,
        sortOrder,
        sortedCryptocurrencies,
        isEditing,
        isModalOpen,
        loadCryptocurrencies,
        openCreateModal,
        createCryptocurrency,
        openEditModal,
        updateCryptocurrency,
        deleteCryptocurrency,
        closeModal,
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
  
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
  }
  
  .modal-content {
    background: white;
    border-radius: 8px;
    max-width: 500px;
    width: 100%;
    padding: 20px;
  }
  </style>
  