<script setup>

import Filter from "@/components/common/Filter.vue";
import {computed, onMounted, ref, watch} from "vue";
import BaseTable from "@/components/common/BaseTable.vue";
import {deleteHoliday, getHolidays, postHoliday} from "@/features/settings/api.js";
import Pagination from "@/components/common/Pagination.vue";
import {useToast} from "vue-toastification";
import DeleteConfirmToast from "@/components/common/DeleteConfirmToast.vue";
import SideModal from "@/components/common/SideModal.vue";

const toast = useToast();

const holidayCreateModalVisible = ref(false);

const visibleFilterOptions = ref([
    {
      key: 'yearMonth',
      label: '조회 기간',
      type: 'yearmonth'
    }
  ]);

const createModalSections = computed(() => [{
  title: '휴일 생성',
  icon: 'fa-calendar-alt',
  layout: 'one-column',
  fields:[{
    key: 'holidayName', type: 'input', label: '휴일명', editable: true, required: true
  },
    {
      key: 'date', type: 'date', label: '일자', required: true,
      editable: true,
    }
  ]
}]);

const pagination = ref({ totalPage: 0 });
const currentPage = ref(1);

const filterValues = ref({
  yearMonth_year: '',
  yearMonth_month: ''
});

const getReq = ref({
  year:'',
  month:'',
  page:1
})

const postReq = ref({
  date:'',
  holidayName:''
})

const columns = [
  {key: 'holidayId', label: '번호'},
  {key: 'holidayName', label: '휴일명'},
  {key: 'date', label: '일자'},
];

const holidays = ref([]);

const rowActions = [
  {key: 'delete', icon: 'fa-trash', label: '삭제'}
];

function handleRowAction({action, row}) {
  if (action === 'delete')
    handleDeleteHoliday(row);
}

const handleDeleteHoliday = async (row) => {
  const holidayId = row.holidayId;
  try{
    const result = await new Promise((resolve) => {
      toast(
          {
            component: DeleteConfirmToast,
            props: {resolve},
          },
          {
            timeout: false,
            closeOnClick: false,
            showCloseButtonOnHover: false,
          }
      );
    });
    if (!result) return;
    await deleteHoliday(holidayId);
    toast.success('휴일이 삭제되었습니다.');
    await fetchHolidays();
  }catch(e){
    toast.error('휴일 삭제에 실패했습니다.')
  }

}

/* 필터 검색 이벤트 */
const handleSearch = async (filters) => {
  getReq.value.month = filterValues.value.yearMonth_month;
  getReq.value.year = filterValues.value.yearMonth_year;
  currentPage.value = 1;
  await fetchHolidays();
}

//휴일 등록
const handleRegisterSubmit = async () => {
  try{
    await postHoliday(postReq.value);
    toast.success('휴일 등록에 성공했습니다.');
    await fetchHolidays();
    holidayCreateModalVisible.value = false;
    postReq.value.date = '';
    postReq.value.holidayName = '';
  }catch(e){
    toast.error('휴일 등록에 실패했습니다.')
  }
}

//테이블 출력
const fetchHolidays = async ()=>{
  const res = await getHolidays(getReq.value);
  holidays.value = res.data.data.holidayGetDTOList;
  pagination.value.totalPage = res.data.data.pagination.totalPage;
}

watch(currentPage, () => {
  getReq.value.page = currentPage;
  fetchHolidays();
});

onMounted(async () => {
  await fetchHolidays();
})

</script>

<template>
  <div class="button-section">
    <button class="dept-create-button" @click="holidayCreateModalVisible=true">휴일 생성</button>
  </div>
<Filter
    :filters="visibleFilterOptions"
    v-model="filterValues"
    @search="handleSearch"></Filter>
  <BaseTable v-if="holidays.length!==0" :columns="columns" :rows="holidays" :actions="rowActions" @action="handleRowAction"/>
  <div v-else class="empty-state">
    <i class="fas fa-calendar-alt"></i>
    <p>휴일이 없습니다</p>
  </div>
  <Pagination
      v-if="pagination.totalPage"
      :totalPages="pagination.totalPage"
      v-model="currentPage"
  />
  <SideModal
      :visible="holidayCreateModalVisible"
      @close="holidayCreateModalVisible=false"
      title="휴일 생성"
      icon="fas fa-info-circle card-icon"
      v-model:form="postReq"
      :sections = "createModalSections"
      @submit="handleRegisterSubmit(postReq)"
  />
</template>

<style scoped>
.button-section{
  display:flex;
  height: fit-content;
  justify-content: flex-end;
  padding:8px;
}

.dept-create-button{
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: var(--radius-ss);
  border: 1px solid var(--gray-300);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
  background: var(--blue-300);
  color: var(--color-surface);
}

.empty-state {
  text-align: center;
  padding: 48px 0;
}

.empty-state i {
  font-size: 3rem;
  color: var(--gray-500);
  margin-bottom: 16px;
}

.empty-state p {
  color: var(--font-sub);
  font-size: 1rem;
}
</style>