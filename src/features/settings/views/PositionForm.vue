<script setup>
import BaseTable from "@/components/common/BaseTable.vue";
import {computed, onMounted, reactive, ref} from "vue";
import {deletePosition, getPositions, postPosition, putPosition} from "@/features/settings/api.js";
import {useToast} from "vue-toastification";
import DeleteConfirmToast from "@/components/common/DeleteConfirmToast.vue";
import SideModal from "@/components/common/SideModal.vue";
import NoticeItem from "@/features/employee/components/NoticeItem.vue";

const toast = useToast();

const positions = ref([]);

const createModalVisible = ref(false);
const updateModalVisible = ref(false);

const selectedPositionId = ref('');
const createReq = reactive({
  name: '',
  level: ''
});

const updateReq = reactive({
  name: '',
  level: ''
})

const initialReq = {
  name: '',
  level: ''
};

const createModalSections = computed(() => [{
  title: '직위 생성',
  icon: 'fa-info-circle',
  layout: 'one-column',
  fields:[{
    key: 'name', type: 'input', label: '직위명', editable: true, required: true
  }, {
    key: 'level', type: 'number', label: '직위 단계', editable: true, required: true
  }]
}]);

const updateModalSections = computed(() => [{
  title: '직위 수정',
  icon: 'fa-info-circle',
  layout: 'one-column',
  fields:[{
    key: 'name', type: 'input', label: '직위명', editable: true, required: true
  }, {
    key: 'level', type: 'number', label: '직위 단계', editable: true, required: true
  }]
}]);

const columns = [
 // {key: 'positionId', label: '번호'},
  {key: 'name', label: '직위명'},
  {key: 'level', label: '직위 단계'},
];

const rowActions = [
  {key: 'update', icon: 'fa-pen', label: '수정'},
  {key: 'delete', icon: 'fa-trash', label: '삭제'}
];

function handleRowAction({action, row}) {
  if (action === 'update') {
   updateModalVisible.value = true;
   updateReq.level = row.level;
   updateReq.name = row.name;
   updateReq.positionId = row.positionId;
   selectedPositionId.value = row.positionId;
  }
  if (action === 'delete')
    handleDeletePosition(row);
}

const handleCreateSubmit = async(req) => {
  try{
    await postPosition(req);
    toast.success('직위 생성에 성공했습니다.');
    await getPositionList();
    createModalVisible.value = false;
    Object.assign(createReq, initialReq);
  }catch(e){
    const message = e.response.data.message;
    toast.error(message);
  }
}

const handleUpdateSubmit = async (req) => {
  try{
    await putPosition(req);
    toast.success('직위 수정에 성공했습니다.');
    await getPositionList();
    updateModalVisible.value = false;
    Object.assign(updateReq, initialReq);
  }catch(e){
    toast.error(e.response.data.message);
  }
}

const handleDeletePosition = async (row) => {
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

    await deletePosition(row.positionId);
    toast.success('직위가 삭제되었습니다.');
    await getPositionList();
  } catch (e) {

    const message = e.response.data.message;
    toast.error(message);
  }
}

const getPositionList = async () => {
  try{
    const response = await getPositions();
    positions.value = response.data.data.positionDtoList;
  }catch(e){
    toast.error('직위 조회에 실패했습니다.')
  }
}

onMounted(async () => {
  await getPositionList();
})
</script>

<template>
  <div class="header">
    <!-- Additional Info -->
    <div class = "header-info">
      <NoticeItem
      icon="fa-info-circle"
      text="숫자가 작을수록 높은 직위입니다."
      color="blue"
      />
    </div>
    <div class="header-buttons">
      <button class="create-button" @click="createModalVisible=true">
        <i class="fas fa-plus"></i>
        <span>직위 생성</span>
      </button>
    </div>
  </div>

  <!-- 테이블 -->
  <BaseTable :columns="columns" :rows="positions" :actions="rowActions" @action="handleRowAction"/>

  <SideModal
      :visible="createModalVisible"
      @close="createModalVisible=false"
      title="직위 생성"
      icon="fas fa-info-circle card-icon"
      v-model:form="createReq"
      :sections = "createModalSections"
      @submit="handleCreateSubmit(createReq)"
  >
  </SideModal>

  <SideModal
      :visible="updateModalVisible"
      @close="updateModalVisible=false"
      title="직위 수정"
      icon="fas fa-info-circle card-icon"
      v-model:form="updateReq"
      :sections = "updateModalSections"
      @edit="handleUpdateSubmit(updateReq)"
      :showEdit="true"
      :showSubmit="false"
  >
  </SideModal>
</template>

<style scoped>
.header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom:20px;
  margin-left:20px;
  margin-right:20px;
}

.header-info{
  display: flex;
  gap: 10px;
  flex-direction: row;
  justify-items: center;
}

.create-button i {
  margin-right: 8px;
}

.card-icon {
  color: var(--blue-400);
  font-size: 1.125rem;
  font-weight: 900;
}

.create-button{
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
</style>