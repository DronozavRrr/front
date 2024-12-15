<template>
  <div class="container mt-5">
    <h1 class="text-center mb-4">Панель кошельков</h1>
    <p class="text-center">Просмотр и управление своими данными.</p>
    <div class="text-center mb-3">
      <button class="btn btn-primary" @click="loadWallets">Загрузить кошельки</button>
      <button class="btn btn-success" @click="openModal('create')">Добавить кошелек</button>
      <button class="btn btn-secondary" @click="goBack">Назад</button>
    </div>
    <div v-if="wallets.length" class="table-responsive">
      <h2 class="text-center mb-3">Ваши кошельки</h2>
      <table class="table table-striped">
        <thead>
          <tr>
            <th @click="sort('cryptoid')" class="sortable">
              Криптовалюта
              <span v-if="sortKey === 'cryptoid'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sort('balance')" class="sortable">
              Баланс
              <span v-if="sortKey === 'balance'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sort('userid')" class="sortable">
              Пользователь
              <span v-if="sortKey === 'userid'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="wallet in sortedWallets" :key="wallet.walletid">
            <td>{{ wallet.cryptoid }}</td>
            <td>{{ wallet.balance }}</td>
            <td>{{ wallet.userid }}</td>
            <td>
              <button class="btn btn-warning btn-sm" @click="openModal('edit', wallet)">Редактировать</button>
              <button class="btn btn-danger btn-sm" @click="deleteWallet(wallet.walletid)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center">
      <p>Кошельков не найдено</p>
    </div>

    <!-- Модальное окно -->
    <div v-if="isModalOpen" class="modal d-block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ modalType === 'create' ? 'Добавить кошелек' : 'Редактировать кошелек' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <div class="mb-3">
                <label for="cryptoid" class="form-label">Криптовалюта</label>
                <input type="number" id="cryptoid" v-model="form.cryptoid" class="form-control" required>
              </div>
              <div class="mb-3">
                <label for="balance" class="form-label">Баланс</label>
                <input type="number" id="balance" v-model="form.balance" class="form-control" required>
              </div>
              <div class="mb-3">
                <label for="userid" class="form-label">Пользователь</label>
                <input type="number" id="userid" v-model="form.userid" class="form-control" required>
              </div>
              <button type="submit" class="btn btn-primary">{{ modalType === 'create' ? 'Добавить' : 'Сохранить' }}</button>
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
    const wallets = ref([]);
    const isModalOpen = ref(false);
    const modalType = ref('create'); // create | edit
    const form = ref({
      walletid: null,
      cryptoid: '',
      balance: '',
      userid: '',
    });

    const sortKey = ref('');
    const sortOrder = ref('asc');

    const sortedWallets = computed(() => {
      if (!sortKey.value) return wallets.value;

      const sorted = [...wallets.value].sort((a, b) => {
        if (a[sortKey.value] < b[sortKey.value]) return sortOrder.value === 'asc' ? -1 : 1;
        if (a[sortKey.value] > b[sortKey.value]) return sortOrder.value === 'asc' ? 1 : -1;
        return 0;
      });

      return sorted;
    });

    const sort = (key) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
      }
    };

    const loadWallets = async () => {
      try {
        const role = localStorage.getItem('role') || 'Guest';

        const response = await api.get('/wallets', {
          params: { role },
        });
        wallets.value = response.data;
      } catch (error) {
        console.error('Ошибка загрузки кошельков:', error);
      }
    };

    const openModal = (type, wallet = {}) => {
      modalType.value = type;
      if (type === 'edit') {
        form.value = { ...wallet };
      } else {
        form.value = { walletid: null, cryptoid: '', balance: '', userid: '' };
      }
      isModalOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
    };

    const submitForm = async () => {
      try {
        const role = localStorage.getItem('role') || 'Guest';
        if (modalType.value === 'create') {
          await api.post('/wallets', form.value, {
            params: { role },
          });
        } else {
          await api.put(`/wallets/${form.value.walletid}`, form.value, {
            params: { role },
          });
        }
        closeModal();
        loadWallets();
      } catch (error) {
        console.error('Ошибка сохранения кошелька:', error);
      }
    };

    const deleteWallet = async (walletid) => {
      try {
        const role = localStorage.getItem('role') || 'Guest';
        await api.delete(`/wallets/${walletid}`, {
          params: { role },
        });
        loadWallets();
      } catch (error) {
        console.error('Ошибка удаления кошелька:', error);
      }
    };

    const goBack = () => {
      window.history.back();
    };

    return {
      wallets,
      sortedWallets,
      sort,
      sortKey,
      sortOrder,
      isModalOpen,
      modalType,
      form,
      loadWallets,
      openModal,
      closeModal,
      submitForm,
      deleteWallet,
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
