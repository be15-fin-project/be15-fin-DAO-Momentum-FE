<script setup>
import { watch, ref, onMounted } from 'vue'
import OrgTree from '@/features/retention-support/components/OrgTree.vue'
import MemberList from '@/features/retention-support/components/MemberList.vue'
import { fetchDepartmentInfo } from '@/features/company/api.js'

const props = defineProps({
  modelValue: [String, Number, null],
  field: Object,
  readonly: Boolean
})

const emit = defineEmits(['update:modelValue'])

const selectedDeptId = ref(null)
const members = ref([])

const handleDeptSelect = async (deptId) => {
  selectedDeptId.value = deptId;
  try {
    const res = await fetchDepartmentInfo(deptId);
    members.value = res.data.data.departmentMemberDTOList || [];
  } catch (e) {
    toast.error('부서 정보 조회 실패');
    members.value = [];
  }
};


const handleMemberSelect = (empId) => {
  emit('update:modelValue', empId)
}

watch(() => props.modelValue, async (empId) => {
  const deptId = props.field.initialDeptId;

  if (deptId) {
    await handleDeptSelect(deptId);
  }

  if (empId) {
    emit('update:modelValue', empId);
  }
}, { immediate: true });


</script>

<template>
  <div class="member-picker-wrapper">
    <label class="form-label" :class="{ required: field.required }">
    </label>
    <div class="picker-grid">
      <OrgTree
          :dtoList="field.treeData"
          :initialDeptId="field.initialDeptId"
          @selectDept="handleDeptSelect"
      />
      <div class="member-list-container">
        <MemberList
            :members="members"
            :clickable="true"
            :selectedEmpId="modelValue"
            @click="handleMemberSelect"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.member-picker-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.picker-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 16px;
}
.member-list-container {
  overflow-y: auto;
}
.member-list-container::-webkit-scrollbar {
  width: 4px !important;
}

.selected-preview {
  padding: 8px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-top: 8px;
  font-size: 0.9rem;
  color: var(--font-main);
}
</style>
