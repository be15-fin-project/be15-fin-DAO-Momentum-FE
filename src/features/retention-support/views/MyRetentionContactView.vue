<template>
  <main>
    <HeaderWithTabs :headerItems="headerTabs" :showTabs="false" />

    <EmployeeFilter
        :filters="filterOptions"
        v-model="filterValues"
        @search="handleSearch"
    />

    <BaseTable
        :columns="tableColumns"
        :rows="mappedTableData"
        @click-detail="(row) => openModalHandler(row)"
    />

    <Pagination
        v-if="pagination.totalPage >= 1"
        :total-pages="pagination.totalPage"
        v-model="currentPage"
    />

    <SideModal
        v-model:visible="isOpen"
        title="면담 상세 정보"
        icon="fa-comments"
        :showSubmit="isFeedbackWritable"
        submitText="면담 보고"
        :sections="formSections"
        @close="isOpen = false"
        @submit="handleSubmit"
        v-model:form="formData"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth.js';

import {
  getMyRetentionContacts,
  getRetentionContactDetail,
  submitRetentionResponse
} from '@/features/retention-support/api';

import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import SideModal from '@/components/common/SideModal.vue';
import { useToast } from 'vue-toastification';

const toast = useToast();

const currentPage = ref(1);
const filterValues = ref({});
const tableData = ref([]);
const pagination = ref({ currentPage: 1, totalPage: 1 });

const isOpen = ref(false);
const formData = ref({ response: '' });
const formSections = ref([]);
const selectedRow = ref(null);
const isFeedbackWritable = ref(false);

const route = useRoute();
const authStore = useAuthStore();
const { userRole } = storeToRefs(authStore);

const filterOptions = ref([
  { key: 'targetNo', label: '사번', icon: 'fa-id-badge', type: 'input', placeholder: '사번 입력' },
  { key: 'date', label: '요청일', icon: 'fa-calendar-day', type: 'date-range' }
]);

const tableColumns = [
  { key: 'createdAt', label: '요청일' },
  { key: 'targetName', label: '대상자' },
  { key: 'deptName', label: '부서' },
  { key: 'positionName', label: '직위' },
  { key: 'managerName', label: '담당자' },
  { key: 'reason', label: '요청 사유' },
  { key: 'action', label: '상세' }
];

const headerTabs = computed(() => {
  const tabs = [{ label: '면담 요청 내역', to: '/retention/my-contacts', active: route.path === '/retention/my-contacts' }];
  if (userRole.value.includes('HR_MANAGER')) {
    tabs.push({ label: '면담 내역', to: '/retention/contact-list', active: route.path === '/retention/contact-list' });
  }
  return tabs;
});

const handleSearch = async (values) => {
  const params = {
    ...values,
    startDate: values.date_start,
    endDate: values.date_end,
    page: currentPage.value,
    size: 10
  };
  delete params.date_start;
  delete params.date_end;

  try {
    const res = await getMyRetentionContacts(params);
    tableData.value = res.items || [];
    pagination.value = {
      currentPage: res.pagination?.currentPage || 1,
      totalPage: res.pagination?.totalPage || 1
    };
  } catch (e) {
    toast.error('면담 요청 내역 조회 중 오류가 발생했습니다.');
    tableData.value = [];
  }
};

const mappedTableData = computed(() =>
    tableData.value.map(row => ({
      ...row,
      retentionId: row.retention_id,
      createdAt: row.createdAt?.split('T')[0] ?? ''
    }))
);

const openModalHandler = async (row) => {
  try {
    const detail = await getRetentionContactDetail(row.retentionId);

    selectedRow.value = row;
    isFeedbackWritable.value = !detail.feedbackWritable;
    isOpen.value = true;

    // formData에 key 기반 값들만 담기
    formData.value = {
      response: detail.response ?? ''
    };

    formSections.value = [
      {
        title: '기본 정보',
        icon: 'fa-user',
        layout: 'two-column',
        fields: [
          { label: '요청일', value: detail.createdAt?.split('T')[0], type: 'input', editable: false },
          { label: '대상자', value: `${detail.targetName} (${detail.targetNo})`, type: 'input', editable: false },
          { label: '부서', value: detail.deptName, type: 'input', editable: false },
          { label: '직위', value: detail.positionName, type: 'input', editable: false },
          { label: '담당자', value: detail.managerName, type: 'input', editable: false }
        ]
      },
      {
        title: '면담 요청 정보',
        icon: 'fa-envelope-open-text',
        layout: 'one-column',
        fields: [
          { label: '요청 사유', value: detail.reason, type: 'textarea', editable: false }
        ]
      },
      {
        title: '면담 결과',
        icon: 'fa-comment-dots',
        layout: 'one-column',
        fields: [
          {
            key: 'response',
            label: '면담 보고',
            type: 'textarea',
            editable: !detail.feedbackWritable
          },
          {
            label: '처리일시',
            value: detail.responseAt
                ? detail.responseAt.split('T')[0]
                : new Date().toISOString().split('T')[0], // 오늘 날짜로 대체
            type: 'input',
            editable: false
          }
          ,
          {
            label: '인사팀 피드백',
            value: detail.feedback ?? '-',
            type: 'textarea',
            editable: false
          }
        ]
      }
    ];
  } catch (e) {
    toast.error('면담 상세 정보를 불러오는 데 실패했습니다.');
    isOpen.value = false;
  }
};

const handleSubmit = async () => {
  if (!selectedRow.value) return;
  const response = formData.value.response?.trim();
  if (!response) return toast.error('면담 보고 내용을 입력해주세요.');

  try {
    await submitRetentionResponse(selectedRow.value.retentionId, response);
    toast.success('면담 보고가 완료되었습니다.');
    isOpen.value = false;
    await handleSearch(filterValues.value);
  } catch (e) {
    toast.error('면담 보고 중 오류가 발생했습니다.');
  }
};

watch(currentPage, () => handleSearch(filterValues.value));

onMounted(() => {
  handleSearch(filterValues.value);
});
</script>
