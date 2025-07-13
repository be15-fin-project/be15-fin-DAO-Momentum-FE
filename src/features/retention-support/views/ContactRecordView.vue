<template>
  <main>
    <HeaderWithTabs
        :headerItems="headerTabs"
        :submitButtons="[{ label: '면담 요청', icon: 'fa-paper-plane', event: 'openModal', variant: 'blue' }]"
        :showTabs="false"
        @openModal="handleSubmitModal"
    />

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

    <!-- 면담 요청 등록 모달 -->
    <SideModal
        v-model:visible="isSubmitModalOpen"
        title="면담 요청 등록"
        icon="fa-paper-plane"
        :showSubmit="true"
        submitText="등록"
        :sections="submitFormSections"
        @close="isSubmitModalOpen = false"
        @submit="handleCreateContact"
        v-model:form="formData"
    />

    <!-- 면담 기록 상세 모달 -->
    <SideModal
        v-model:visible="isOpen"
        title="면담 기록 상세"
        icon="fa-comments"
        :sections="detailFormSections"
        :showSubmit="showFeedbackButton"
        submitText="피드백"
        @close="isOpen = false"
        @submit="handleFeedbackSubmit"
        v-model:form="formData"
    />


  </main>
</template>

<script setup>
import {ref, onMounted, watch, computed} from 'vue';
import {useRoute} from 'vue-router';
import {storeToRefs} from 'pinia';
import {useAuthStore} from '@/stores/auth.js';

import {
  getRetentionContacts,
  getRetentionContactDetail,
  createRetentionContact,
  submitRetentionFeedback
} from '@/features/retention-support/api.js';
import {getDepartments, getPositions} from '@/features/works/api.js';

import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import SideModal from '@/components/common/SideModal.vue';
import {useToast} from 'vue-toastification';

const toast = useToast();

/* ===== 상태 ===== */
const currentPage = ref(1);
const filterValues = ref({});
const tableData = ref([]);
const pagination = ref({currentPage: 1, totalPage: 1});

const isOpen = ref(false);
const isSubmitModalOpen = ref(false);
const selectedRow = ref(null);
const showFeedbackButton = ref(false);

const formData = ref({});
const submitFormSections = ref([]);
const detailFormSections = ref([]);

const departmentTree = ref([]);
const positionList = ref([]);
const filterOptions = ref([]);

const route = useRoute();
const authStore = useAuthStore();
const {userRole} = storeToRefs(authStore);

/* ===== 초기 로딩 ===== */
onMounted(async () => {
  try {
    const [deptRes, posRes] = await Promise.all([
      getDepartments(),
      getPositions()
    ]);

    departmentTree.value = deptRes.data?.departmentInfoDTOList || [];
    positionList.value = posRes;

    initFilters();
    await handleSearch(filterValues.value);
  } catch (e) {
    toast.error('초기화 중 오류가 발생했습니다.');
  }
});

/* ===== 필터 옵션 정의 ===== */
const initFilters = () => {
  filterOptions.value = [
    {
      key: 'deptId',
      label: '부서',
      icon: 'fa-building',
      type: 'tree',
      options: departmentTree.value
    },
    {
      key: 'positionId',
      label: '직위',
      icon: 'fa-briefcase',
      type: 'select',
      options: ['전체', ...positionList.value.map(p => ({
        label: p.name,
        value: p.positionId
      }))]
    },
    {
      key: 'targetNo',
      label: '대상자',
      icon: 'fa-id-badge',
      type: 'input',
      placeholder: '사번 입력'
    },
    {
      key: 'managerNo',
      label: '진행자',
      icon: 'fa-user-tie',
      type: 'input',
      placeholder: '사번 입력'
    },
    {
      key: 'date',
      label: '요청일',
      icon: 'fa-calendar-day',
      type: 'date-range'
    }
  ];
};

const normalizeFilterParams = (values) => {
  const normalized = {...values};

  if (normalized.date_start) {
    normalized.startDate = normalized.date_start;
    delete normalized.date_start;
  }
  if (normalized.date_end) {
    normalized.endDate = normalized.date_end;
    delete normalized.date_end;
  }

  if (typeof normalized.deptId === 'string') {
    normalized.deptId = Number(normalized.deptId);
  }

  if (normalized.positionId && normalized.positionId !== '전체') {
    const found = positionList.value.find(p =>
        p.positionId === normalized.positionId || p.name === normalized.positionId
    );
    normalized.positionId = found?.positionId ?? null;
  } else {
    normalized.positionId = null;
  }

  return normalized;
};
/* ===== 테이블 컬럼 ===== */
const tableColumns = [
  {key: 'profile', label: '#'},
  {key: 'targetName', label: '대상자'},
  {key: 'deptName', label: '부서'},
  {key: 'positionName', label: '직위'},
  {key: 'managerName', label: '진행자'},
  {key: 'reason', label: '요청 사유'},
  {key: 'createdAt', label: '요청일'},
  {key: 'action', label: '상세'}
];


/* ===== 목록 조회 ===== */
const handleSearch = async (values) => {
  const params = {
    ...normalizeFilterParams(values),
    page: currentPage.value,
    size: 10
  };

  try {
    const res = await getRetentionContacts(params);
    tableData.value = res.items || [];
    pagination.value = {
      currentPage: res.pagination?.currentPage || 1,
      totalPage: res.pagination?.totalPage || 1
    };
  } catch (e) {
    toast.error('면담 기록을 불러오는 데 실패했습니다.');
    tableData.value = [];
  }
};

const mappedTableData = computed(() =>
    tableData.value.map(row => ({
      ...row,
      createdAt: row.createdAt?.split('T')[0] ?? ''
    }))
);

/* ===== 상세 모달 열기 ===== */
const openModalHandler = async (row) => {
  try {
    const detail = await getRetentionContactDetail(row.retentionId);
    selectedRow.value = row;
    isOpen.value = true;

    // 버튼 노출 여부 설정
    showFeedbackButton.value = detail.feedbackWritable === true;

    formData.value = {
      createdAt: detail.createdAt?.split('T')[0] ?? '',
      target: `${detail.targetName} (${detail.targetNo})`,
      deptName: detail.deptName,
      positionName: detail.positionName,
      managerNo: detail.managerNo,
      managerName: detail.managerName,
      reason: detail.reason,
      response: detail.response ?? '-',
      responseAt: detail.responseAt
          ? detail.responseAt.split('T')[0]
          : '-',
      feedback: detail.feedback ?? '-'
    };

    detailFormSections.value = [
      {
        title: '기본 정보',
        icon: 'fa-user',
        layout: 'two-column',
        fields: [
          {key: 'deptName', label: '부서', type: 'input', editable: false},
          {key: 'positionName', label: '직위', type: 'input', editable: false},
          {key: 'target', label: '대상자', type: 'input', editable: false},
          {key: 'createdAt', label: '요청일', type: 'input', editable: false},
        ]
      },
      {
        title: '진행자 정보',
        icon: 'fa-user-tie',
        layout: 'two-column',
        fields: [
          {key: 'managerName', label: '진행자 이름', type: 'input', editable: false},
          {key: 'managerNo', label: '진행자 사번', type: 'input', editable: false}
        ]
      },
      {
        title: '면담 요청 정보',
        icon: 'fa-envelope-open-text',
        layout: 'one-column',
        fields: [
          {key: 'reason', label: '요청 사유', type: 'textarea', editable: false}
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
            editable: false
          },
          {
            key: 'responseAt',
            label: '처리일시',
            type: 'input',
            editable: false
          },
          {
            key: 'feedback',
            label: '인사팀 피드백',
            type: 'textarea',
            editable: detail.feedbackWritable === true
          }
        ]
      }
    ];
  } catch (e) {
    toast.error('면담 상세 정보를 불러오는 데 실패했습니다.');
    isOpen.value = false;
  }
};

const handleFeedbackSubmit = async () => {
  const retentionId = selectedRow.value?.retentionId;
  const feedback = formData.value.feedback?.trim();

  if (!retentionId || !feedback) {
    toast.error('피드백 내용을 입력해주세요.');
    return;
  }

  try {
    await submitRetentionFeedback(retentionId, feedback);
    toast.success('피드백이 저장되었습니다.');
    isOpen.value = false;
    await handleSearch(filterValues.value); // 목록 새로고침
  } catch (e) {
    toast.error('피드백 저장 중 오류가 발생했습니다.');
  }
};


/* ===== 등록 모달 열기 ===== */
const handleSubmitModal = async ({
   targetId = null,
   managerId = null,
   targetDeptId = null,
   managerDeptId = null
} = {}) => {
  if (!departmentTree.value?.length) {
    try {
      const deptRes = await getDepartments();
      departmentTree.value = deptRes.data?.departmentInfoDTOList || [];
    } catch (e) {
      toast.error('부서 정보를 불러올 수 없습니다.');
      return;
    }
  }

  isSubmitModalOpen.value = true;

  formData.value = {
    targetId,
    managerId,
    reason: ''
  };

  submitFormSections.value = [
    {
      title: '면담 대상자',
      icon: 'fa-user',
      layout: 'memberPicker',
      fields: [
        {
          key: 'targetId',
          label: '대상자 선택',
          type: 'memberPicker',
          treeData: departmentTree.value,
          required: true,
          value: targetId,
          initialDeptId: targetDeptId
        }
      ]
    },
    {
      title: '진행자(상급자)',
      icon: 'fa-user-tie',
      layout: 'memberPicker',
      fields: [
        {
          key: 'managerId',
          label: '상급자 선택',
          type: 'memberPicker',
          treeData: departmentTree.value,
          required: true,
          value: managerId,
          initialDeptId: managerDeptId
        }
      ]
    },
    {
      title: '면담 요청 사유',
      icon: 'fa-envelope-open-text',
      layout: 'one-column',
      fields: [
        {
          key: 'reason',
          label: '요청 사유',
          type: 'textarea',
          placeholder: '면담 요청 사유를 입력해주세요',
          required: true,
          editable: true
        }
      ]
    }
  ];
};

/* ===== 등록 처리 ===== */
// 등록 전에 로딩 상태 표시
const isLoading = ref(false);

const handleCreateContact = async () => {
  const {targetId, managerId, reason} = formData.value;

  if (!targetId || !managerId || !reason?.trim()) {
    toast.error('모든 항목을 입력해주세요.');
    return;
  }

  if (targetId === managerId) {
    toast.error('대상자와 진행자는 서로 달라야 합니다.');
    return;
  }

  isLoading.value = true;
  try {
    await createRetentionContact(formData.value);
    toast.success('면담 요청이 등록되었습니다.');
    isSubmitModalOpen.value = false;
    await handleSearch(filterValues.value);
  } catch (e) {
    toast.error('면담 요청 중 오류가 발생했습니다.');
  } finally {
    isLoading.value = false;
  }
};

/* ===== 페이지 변경 감지 ===== */
watch(currentPage, () => handleSearch(filterValues.value));

/* ===== 상단 탭 ===== */
const headerTabs = computed(() => [
  {label: '면담 요청 내역', to: '/retention/my-contacts', active: route.path === '/retention/my-contacts'},
  {label: '면담 내역', to: '/retention/contact-list', active: route.path === '/retention/contact-list'}
]);

onMounted(() => {
  const targetId = route.query.targetId;
  const managerId = route.query.managerId;
  if (targetId && managerId) {
    handleSubmitModal({
      targetId: Number(route.query.targetId),
      managerId: Number(route.query.managerId),
      targetDeptId: Number(route.query.targetDeptId),
      managerDeptId: Number(route.query.managerDeptId),
    });
  }
});

</script>
