<template>
    <div class="container mt-5">
      <h1 class="text-center mb-4">Курсы криптовалют</h1>
      <p class="text-center">Просмотр и управление курсами криптовалют.</p>
  
      <div class="text-center mb-3">
        <button class="btn btn-primary" @click="loadCryptoRates">Загрузить курсы</button>
        <button class="btn btn-success" @click="showCreateModal">Добавить курс</button>
        <button class="btn btn-secondary" @click="goBack">Назад</button>
        <button class="btn btn-info" @click="printTable">Печать таблицы</button>
      </div>
  
      <div v-if="sortedRates.length" class="table-responsive">
        <h2 class="text-center mb-3">Список курсов</h2>
        <table class="table table-striped" id="cryptoTable">
          <thead>
            <tr>
              <th>ID курса</th>
              <th>Криптовалюта</th>
              <th>Курс</th>
              <th>Время обновления</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rate in sortedRates" :key="rate.rateid">
              <td>{{ rate.rateid }}</td>
              <td>{{ rate.cryptoname }}</td>
              <td>{{ rate.rate }}</td>
              <td>{{ rate.time }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center">
        <p>Курсы криптовалют не найдены</p>
      </div>
  
      <!-- Модальное окно -->
      <div v-if="showModal" class="custom-modal">
        <div class="custom-modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? 'Редактировать курс' : 'Добавить курс' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="isEditing ? updateRate() : createRate()">
              <div class="mb-3">
                <label for="cryptoID" class="form-label">ID криптовалюты</label>
                <input type="number" v-model="currentRate.cryptoID" id="cryptoID" class="form-control" required />
              </div>
              <div class="mb-3">
                <label for="rate" class="form-label">Курс</label>
                <input type="number" v-model="currentRate.rate" id="rate" class="form-control" required />
              </div>
              <div class="mb-3">
                <label for="time" class="form-label">Время</label>
                <input type="datetime-local" v-model="currentRate.time" id="time" class="form-control" />
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
      const rates = ref([]);
      const currentRate = ref({ cryptoID: "", rate: "", time: "" });
      const isEditing = ref(false);
      const showModal = ref(false);
      const sortKey = ref("");
      const sortOrder = ref("asc");
      const role = localStorage.getItem("role") || "Guest";
  
      const sortedRates = computed(() => {
        if (!sortKey.value) return rates.value;
        return [...rates.value].sort((a, b) => {
          if (a[sortKey.value] < b[sortKey.value]) return sortOrder.value === "asc" ? -1 : 1;
          if (a[sortKey.value] > b[sortKey.value]) return sortOrder.value === "asc" ? 1 : -1;
          return 0;
        });
      });
  
      const loadCryptoRates = async () => {
        try {
          const response = await api.get("/cryptorates", { params: { role } });
          rates.value = response.data;
        } catch (error) {
          console.error("Ошибка загрузки курсов криптовалют:", error);
        }
      };
  
      const showCreateModal = () => {
        currentRate.value = { cryptoID: "", rate: "", time: "" };
        isEditing.value = false;
        showModal.value = true;
      };
  
      const createRate = async () => {
        try {
          const response = await api.post("/cryptorates", currentRate.value, { params: { role } });
          rates.value.push(response.data);
          closeModal();
        } catch (error) {
          console.error("Ошибка создания курса:", error);
        }
      };
  
      const updateRate = async () => {
        try {
          const response = await api.put(`/cryptorates/${currentRate.value.rateid}`, currentRate.value, {
            params: { role },
          });
          const index = rates.value.findIndex((r) => r.rateid === response.data.rateid);
          rates.value[index] = response.data;
          closeModal();
        } catch (error) {
          console.error("Ошибка обновления курса:", error);
        }
      };
  
      const deleteRate = async (id) => {
        if (!confirm("Вы уверены, что хотите удалить этот курс?")) return;
  
        try {
          await api.delete(`/cryptorates/${id}`, { params: { role } });
          rates.value = rates.value.filter((rate) => rate.rateid !== id);
        } catch (error) {
          console.error("Ошибка удаления курса:", error);
        }
      };
  
      const closeModal = () => {
        showModal.value = false;
      };
  
      const goBack = () => {
        window.history.back();
      };
  
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
  
      return {
        rates,
        currentRate,
        isEditing,
        showModal,
        sortedRates,
        loadCryptoRates,
        showCreateModal,
        createRate,
        updateRate,
        deleteRate,
        closeModal,
        goBack,
        printTable,
      };
    },
  };
  </script>
  