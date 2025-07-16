<script setup>
import {reactive, computed, watch, ref, onMounted} from 'vue';
import Pagination from '@/components/common/Pagination.vue';
import Filter from '@/components/common/Filter.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import SideModal from '@/components/common/SideModal.vue';
import {createContract, deleteContract, getContracts} from '@/features/employee/api.js';
import {getFileUrl} from '@/features/common/api.js';
import {generatePresignedUrl} from '@/features/announcement/api.js';
import {useToast} from "vue-toastification";
import DeleteConfirmToast from "@/components/common/DeleteConfirmToast.vue";
import {getDepartments} from "@/features/works/api.js";

const toast = useToast();

// 페이지, 페이징, 필터, 데이터 상태
const currentPage = ref(1);
const pagination = ref({currentPage: 1, totalPage: 1});
const filterValues = ref({});
const contracts = ref([]);
const showModal = ref(false);

const departmentTree = ref([]);

// 테이블 컬럼
const columns = [
  {key: 'empNo', label: '사번'},
  {key: 'empName', label: '사원명'},
  // {key: 'deptName', label: '부서'},
  // {key: 'positionName', label: '직위'},
  {
    key: 'type',
    label: '계약서 종류',
    format: val => {
      switch (val) {
        case 'EMPLOYEE_AGREEMENT':
          return '근로계약서';
        case 'SALARY_AGREEMENT':
          return '연봉계약서';
        default:
          return val;
      }
    }
  },
  {key: 'salary', label: '연봉', format: val => val == null ? '-' : Math.round(val).toLocaleString() + "원"},
  {key: 'createdAt', label: '등록일', format: val => val.split('T')[0]},
  // { key: 'action', label: '다운로드' },
];

const rowActions = [
  {key: 'download', icon: 'fa-download', label: '다운로드'},
  {key: 'delete', icon: 'fa-trash', label: '삭제'}
];

function handleRowAction({action, row}) {
  if (action === 'download') downloadFile(row);
  if (action === 'delete') handleDeleteContract(row);
}

// 필터 옵션
const filterOptions = computed(() => [
  {key: 'empNo', type: 'input', label: '사번', icon: 'fa-id-badge', placeholder: '사번 입력'},
  {key: 'empName', type: 'input', label: '사원명', icon: 'fa-user', placeholder: '이름 입력'},
  // {key: 'deptId', type: 'select', label: '부서', icon: 'fa-building', options: deptOptions.value},
  // {key: 'positionId', type: 'select', label: '직위', icon: 'fa-user-tie', options: positionOptions.value},
  {key: 'createdAt', type: 'date-range', label: '등록일', icon: 'fa-calendar-day'},
  {
    key: 'order',
    type: 'select',
    label: '정렬 (등록일)',
    icon: 'fa-sort',
    options: [
      {label: '오름차순', value: 'ASC'},
      {label: '내림차순', value: 'DESC'}
    ]
  },
  {
    key: 'type',
    type: 'select',
    label: '계약서 종류',
    icon: 'fa-filter',
    options: [
      {label: '전체', value: null},
      {label: '근로계약서', value: 'EMPLOYEE_AGREEMENT'},
      {label: '연봉계약서', value: 'SALARY_AGREEMENT'}
    ]
  }
]);

// 필터 값을 API 파라미터로 변환
const setParams = (v) => ({
  empNo: v.empNo || null,
  empName: v.empName || null,
  // deptId: v.deptId ?? null,
  // positionId: v.positionId ?? null,
  searchStartDate: v.createdAt_start || null,
  searchEndDate: v.createdAt_end || null,
  order: v.order || null,
  type: v.type ?? null,
});

// 데이터 호출
const fetchSummary = async (values) => {
  const params = {
    ...setParams(values),
    page: currentPage.value,
    size: 10,
  };
  try {
    const resp = await getContracts(params);
    contracts.value = resp.contracts || [];
    const current = resp.pagination?.currentPage || 1;
    const total = resp.pagination?.totalPage > 0 ? resp.pagination.totalPage : 1;
    pagination.value = {currentPage: current, totalPage: total};
  } catch (e) {
    contracts.value = [];
    pagination.value = {currentPage: 1, totalPage: 1};

    const message = e?.response?.data?.message;
    toast.error(message || '계약서 목록 조회 실패')
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchSummary(filterValues.value);
};

onMounted(async () => {
  const depts = await getDepartments();
  departmentTree.value = depts.data?.departmentInfoDTOList || [];
  handleSearch();
  filterValues.value = {};
});

watch(currentPage, () => fetchSummary(filterValues.value));

// reactive req 객체 초기화 함수
function initializeRequest(type = null) {
  return reactive({
    empId: null,
    type,
    salary: null,
    attachment: reactive({
      s3Key: null,
      type: null,
      name: null,
    }),
  });
}

const req = reactive(initializeRequest());

// modalSections 함수
function getModalSections(type) {
  const salaryEditable = type === 'SALARY_AGREEMENT';

  // 기본 필드
  const fields = [
    {
      key: 'empId', label: '사원', type: 'memberPicker', treeData: departmentTree.value || [],
      editable: true, required: true, placeholder: '1'
    },
    {key: 'attachment', label: '첨부 파일', type: 'file', editable: true, required: true},
    {
      key: 'type',
      label: '계약서 종류',
      type: 'select',
      editable: true,
      required: true,
      options: [
        {label: '근로계약서', value: 'EMPLOYEE_AGREEMENT'},
        {label: '연봉계약서', value: 'SALARY_AGREEMENT'}
      ],
    }
  ];

  // SALARY_AGREEMENT일 때만 연봉 필드 추가
  if (salaryEditable) {
    fields.push({
      key: 'salary',
      label: '연봉',
      type: 'input',
      editable: true,
      required: true,
      placeholder: '40000000'
    });
  }

  return [
    {
      title: '계약서 정보',
      icon: 'fa-info-circle',
      layout: 'one-column',
      fields
    }
  ];
}

const modalSections = computed(() => getModalSections(req.type));

// salary 초기화
watch(() => req.type, (newType) => {
  if (newType !== 'SALARY_AGREEMENT') {
    req.salary = null;
  }
});

const openCreateModal = () => {
  Object.assign(req, initializeRequest());
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const downloadFile = async (row) => {
  const s3Key = row.s3Key;
  const fileName = row.fileName;

  try {
    const response = await getFileUrl({key: s3Key, fileName: fileName});
    const signedUrl = response.data?.data?.signedUrl;

    if (!signedUrl) {
      toast.error('파일 다운로드 링크를 가져오지 못했습니다.');
      return;
    }

    const fileResp = await fetch(signedUrl);
    if (!fileResp.ok) {
      toast.error('파일 다운로드 실패');
      return;
    }
    const blob = await fileResp.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (e) {
    const message = e?.response?.data?.message;
    toast.error(message || '다운로드 중 오류 발생')
  }
};

const handleDeleteContract = async (row) => {
  try {
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

    await deleteContract(row.contractId);
    toast.success('계약서가 삭제되었습니다.');
    handleSearch();
  } catch (e) {
    const message = e?.response?.data?.message;
    toast.error(message || '계약서 삭제 실패')
  }
};

const getContentTypeWithCharset = (type) => {
  if (type.startsWith('text/') || type === 'text/csv') {
    return `${type}; charset=UTF-8`;
  }
  return type;
};

const handleFileChange = async ({fieldKey, file}) => {
  if (!file) {
    toast.error('파일이 선택되지 않았습니다.');
    return;
  }

  try {
    // 1. Content-Type에 charset 추가(텍스트 파일일 경우)
    const contentType = getContentTypeWithCharset(file.type);
    // 2. presigned URL 요청
    const presignedResp = await generatePresignedUrl({
      fileName: file.name,
      sizeInBytes: file.size,
      contentType,
      prefixType: 'contract',
    });

    const {presignedUrl, s3Key} = presignedResp.data.data

    // 3. S3에 PUT 요청으로 파일 업로드
    const uploadResp = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    });

    if (!uploadResp.ok) {
      toast.error('파일 업로드 실패: S3 업로드 실패');
      return;
    }

    // 4. 업로드 성공 시 req 객체에 메타데이터만 저장
    if (fieldKey === 'attachment' || fieldKey.startsWith('attachment.')) {
      req.attachment.s3Key = s3Key;
      req.attachment.type = file.type;
      req.attachment.name = file.name;
    } else {
      // 만약 다른 필드 키에 대해서도 처리해야 하면 여기에 작성
      // 예: req[fieldKey] = ...
    }

    toast.success('파일 업로드 성공');
  } catch (e) {
    const message = e?.response?.data?.message;
    toast.error(message || '파일 업로드 중 오류가 발생했습니다.')
  }
};

const handleRegisterSubmit = async () => {
  try {
    await createContract(req);
    closeModal();
    handleSearch();
    toast.success('계약서가 등록되었습니다.');
  } catch (e) {
    const message = e?.response?.data?.message;
    toast.error(message || '계약서 등록 실패')
  }
};

const handleHeaderButton = (event) => {
  if (event.value === 'create') {
    openCreateModal();
  }
};
</script>

<template>
  <main>
    <HeaderWithTabs
        :headerItems="[
        { label: '계약서 목록 조회', to: '/contracts', active: true }
      ]"
        :submitButtons="[
        { label: '계약서 등록', icon: 'fa-file-signature', event: 'click', value: 'create', variant: 'blue' }
      ]"
        :showTabs="false"
        @click="handleHeaderButton"
    />

    <Filter :filters="filterOptions" v-model="filterValues" @search="handleSearch"/>

    <BaseTable :columns="columns" :rows="contracts" :actions="rowActions" @action="handleRowAction"/>

    <Pagination
        v-if="pagination.totalPage"
        v-model="currentPage"
        :total-pages="pagination.totalPage"
    />

    <SideModal
        v-if="showModal"
        :visible="showModal"
        v-model:form="req"
        :title="'계약서 등록'"
        icon="fa-file-signature"
        :sections="modalSections"
        @close="closeModal"
        @submit="handleRegisterSubmit"
        @file-change="handleFileChange"
    />
  </main>
</template>
