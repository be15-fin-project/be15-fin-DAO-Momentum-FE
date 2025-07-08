<script setup>
import MemberCard from "@/features/retention-support/components/MemberCard.vue";

const props = defineProps({
  members:{
    type: Array,
    default: () => []
  },
  clickable:{
    type:Boolean,
    default:false
  },
  selectedEmpId: [String, Number, null]
})

const emit = defineEmits(
  ['click']
)

const clickEvent = (empId) => {
  if(props.clickable)
    emit('click',empId);
}

</script>

<template>
  <!-- Members List -->
  <section class="members-section">
    <div class="card slide-in">
      <div class="members-content">
        <div v-if="members.length === 0" class="empty-state">
          <i class="fas fa-user-friends"></i>
          <p>부서를 선택해주세요</p>
        </div>
        <div v-else>
          <!-- MemberList.vue -->
          <MemberCard
              v-for="member in members"
              :key="member.empId"
              :member="member"
              :clickable="clickable"
              :isSelected="member.empId === selectedEmpId"
              @click="clickEvent"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: var(--card-radius);
  padding: 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-subtle);
  height: 100%;
}

.members-content {
  overflow-y: auto;
  height: calc(100% - 80px);
  padding-right: 8px;
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

.slide-in {
  animation: slideInFromLeft 0.8s ease-in-out;
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(20px); /* 왼쪽에서 시작 */
  }
  to {
    opacity: 1;
    transform: translateX(0); /* 원래 위치로 */
  }
}
</style>