<script setup>
import { ref, onMounted } from 'vue'
import OrgTree from '@/features/company/components/OrgTree.vue'
import MemberList from '@/features/company/components/MemberList.vue'
import { fetchDepartments, fetchDepartmentInfo } from '@/features/company/api.js'

/* 부모에게 받는 속성 */
const props = defineProps({
  alreadySelected: { type: Array, default: () => [] },
  disableFirstApproverRemoval: { type: Boolean, default: false }
})

/* 자식에게 확인, 취소 버튼 전파하기 */
const emit = defineEmits(['close', 'confirm'])

/* 가져오는 정보들 */
const departmentInfoDTOList = ref([]);
const selectedDeptId = ref(null);
const members = ref([]);
const selected = ref([]);
const deptName = ref(null);

/* 부서 정보 가져오기 */
const selectDepartment = async (deptId) => {
  selectedDeptId.value = deptId
  const res = await fetchDepartmentInfo(deptId)

  members.value = res.data.data.departmentMemberDTOList;
  deptName.value = res.data.data.departmentDetailDTO.name;
}

/* 멤버 가져오기 */
const clickEvent = (empId) => {
  const exists = selected.value.find(m => m.empId === empId)

  if (props.disableFirstApproverRemoval && selected.value.length > 0 && selected.value[0].empId === empId) {
    return;
  }

  if (exists) {
    selected.value = selected.value.filter(m => m.empId !== empId)
    return
  }

  const emp = members.value.find(e => e.empId === empId)
  if (!emp) return

  // 선택 리스트에 넣기
  selected.value.push({
    empId: emp.empId,
    name: emp.name,
    position: emp.position ,
    deptName: deptName.value || '-',
  })
}


/* 확인 */
const confirmSelection = () => {
  emit('confirm', selected.value)
}


onMounted(async () => {
  const res = await fetchDepartments()
  departmentInfoDTOList.value = res.data.departmentInfoDTOList
  selected.value = [...props.alreadySelected]
})
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <!-- 1. 결재자 선택하기 -->
      <header class="modal-header">
        <h3>결재자 선택</h3>
        <button class="close-button" @click="emit('close')">&times;</button>
      </header>

      <!-- 2. 결재자 보기 (트리 구조로) -->
      <div class="modal-body">
        <div class="main-grid">
          <!-- 조직도 -->
          <OrgTree :dtoList="departmentInfoDTOList" @selectDept="selectDepartment" />
          <!-- 멤버 리스트 -->
          <MemberList :members="members" @click="clickEvent" :clickable="true" />
          <!-- 선택된 사원 -->
          <!-- 선택된 결재자 영역 -->
          <div class="selected-area">
            <h4>선택된 결재자</h4>
            <div v-if="selected.length === 0" class="empty-state">
              <p>선택된 결재자가 없습니다.</p>
            </div>
            <ul class="selected-list">
              <li v-for="(emp, idx) in selected" :key="emp.empId" class="selected-card">
                <i class="fas fa-user icon"></i>
                <div class="info">
                  <div class="name">{{ emp.name }} {{ emp.position }}</div>
                  <div class="dept">{{ emp.deptName || emp.dept || '-' }}</div>
                </div>
                <button
                  class="remove-btn"
                  @click="clickEvent(emp.empId)"
                  v-if="!(props.disableFirstApproverRemoval && idx === 0)"
                >
                  <i class="fas fa-times"></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 3. 확인, 취소 버튼 -->
      <footer class="modal-footer">
        <button class="btn cancel" @click="emit('close')">취소</button>
        <button class="btn confirm" @click="confirmSelection">확인</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  height: calc(100vh - 200px);
}

@media (min-width: 1024px) {
  .main-grid {
    grid-template-columns: 350px 1fr 350px;
  }
}

 .org-item:hover .org-item-content {
  transform: translateX(4px);
  transition: transform 0.3s ease;
}

.org-item.active .org-item-name {
  color: var(--blue-400);
  font-weight: 600;
}

.member-contact i {
  width: 12px;
  text-align: center;
}

.member-contact span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 1000px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.2s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 1.1rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 8px 16px;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn.cancel {
  background: #e5e7eb;
  color: #374151;
}

.btn.confirm {
  background: #3b82f6;
  color: white;
}

.selected-member-card .info {
  flex-grow: 1;
  margin-left: 8px;
}

.selected-member-card .remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #888;
}

.selected-area {
  width: 100%;
  max-width: 300px;
  overflow-y: auto;
  padding: 12px;
}

.selected-area h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--gray-800);
}

.selected-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.selected-card {
  display: flex;
  align-items: center;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}

.selected-card .icon {
  font-size: 16px;
  color: #3b82f6;
  margin-right: 12px;
}

.selected-card .info {
  flex-grow: 1;
}

.selected-card .name {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

.selected-card .dept {
  font-size: 12px;
  color: #6b7280;
}

.remove-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
}

.remove-btn:hover {
  color: #ef4444;
}
</style>