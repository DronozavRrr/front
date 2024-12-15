<template>
  <div class="container mt-5">
    <h1 class="text-center mb-4">Панель пользователей</h1>
    <p class="text-center">Здесь вы можете управлять всеми данными.</p>
    <div class="text-center mb-3">
      <button class="btn btn-primary" @click="loadUsers">Загрузить пользователей</button>
      <button class="btn btn-secondary" @click="goBack">Назад</button>
      <button class="btn btn-success" @click="showAddModal">Добавить пользователя</button>
      <button class="btn btn-info" @click="printTable">Печать таблицы</button>
    </div>

    <div v-if="users.length" class="table-responsive">
      <h2 class="text-center mb-3">Список пользователей</h2>
      <table class="table table-striped" id="cryptoTable">
        <thead>
          <tr>
            <th @click="sort('username')" class="sortable">
              Логин
              <span v-if="sortKey === 'username'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sort('email')" class="sortable">
              Email
              <span v-if="sortKey === 'email'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sort('password')" class="sortable">
              Пароль
              <span v-if="sortKey === 'password'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sort('role')" class="sortable">
              Роль
              <span v-if="sortKey === 'role'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in sortedUsers" :key="user.userid">
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.password }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button class="btn btn-warning btn-sm" @click="editUser(user)">Редактировать</button>
              <button class="btn btn-danger btn-sm" @click="deleteUser(user.userid)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center">
      <p>Пользователи не найдены</p>
    </div>

    <!-- Модальное окно для добавления и редактирования -->
    <div v-if="showModal" class="modal d-block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditMode ? 'Редактировать пользователя' : 'Добавить пользователя' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="isEditMode ? updateUser() : addUser()">
              <div class="mb-3">
                <label for="username" class="form-label">Логин</label>
                <input type="text" id="username" v-model="form.username" class="form-control" required />
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" id="email" v-model="form.email" class="form-control" required />
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Пароль</label>
                <input type="password" id="password" v-model="form.password" class="form-control" required />
              </div>
              <div class="mb-3">
                <label for="role" class="form-label">Роль</label>
                <select id="role" v-model="form.role" class="form-select" required>
                  <option value="Admin">Администратор</option>
                  <option value="User">Пользователь</option>
                  <option value="Guest">Гость</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary w-100">
                {{ isEditMode ? 'Сохранить изменения' : 'Добавить пользователя' }}
              </button>
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
    const users = ref([]);
    const showModal = ref(false);
    const isEditMode = ref(false);
    const form = ref({
      userid: null,
      username: '',
      email: '',
      password: '',
      role: 'User',
    });

    const sortKey = ref('');
    const sortOrder = ref('asc');
    const printTable = () => {
        const table = document.getElementById("cryptoTable").outerHTML;
        const newWindow = window.open("");
        newWindow.document.write("<html><head><title>Печать таблицы</title></head><body>");
        newWindow.document.write("<h1>Курсы криптовалют</h1>");
        newWindow.document.write(table);
        newWindow.document.write("</body></html>");
        newWindow.document.close();
        newWindow.print();
      };

    const sortedUsers = computed(() => {
      if (!sortKey.value) return users.value;

      const sorted = [...users.value].sort((a, b) => {
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

    const loadUsers = async () => {
      try {
        const role = localStorage.getItem('role') || 'Guest';
        const response = await api.get('/users', { params: { role } });
        users.value = response.data;
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
      }
    };

    const showAddModal = () => {
      isEditMode.value = false;
      form.value = { userid: null, username: '', email: '', password: '', role: 'User' };
      showModal.value = true;
    };

    const editUser = (user) => {
      isEditMode.value = true;
      form.value = { ...user };
      showModal.value = true;
    };

    const addUser = async () => {
      try {
        const response = await api.post('/users', { ...form.value });
        users.value.push(response.data);
        closeModal();
      } catch (error) {
        console.error('Ошибка добавления пользователя:', error);
      }
    };

    const updateUser = async () => {
      try {
        const response = await api.put(`/users/${form.value.userid}`, { ...form.value });
        const index = users.value.findIndex((u) => u.userid === form.value.userid);
        if (index !== -1) users.value[index] = response.data;
        closeModal();
      } catch (error) {
        console.error('Ошибка обновления пользователя:', error);
      }
    };

    const deleteUser = async (userID) => {
      try {
        const role = localStorage.getItem('role') || 'Guest';
        await api.delete(`/users/${userID}`, { params: { role } });
        users.value = users.value.filter((u) => u.userid !== userID);
      } catch (error) {
        console.error('Ошибка удаления пользователя:', error);
      }
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const goBack = () => {
      window.history.back();
    };


    return {
      users,
      sortedUsers,
      sort,
      sortKey,
      sortOrder,
      loadUsers,
      showModal,
      isEditMode,
      form,
      showAddModal,
      editUser,
      addUser,
      updateUser,
      deleteUser,
      closeModal,
      goBack,
      printTable
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
