<script setup>

import MemberCard from "@/features/company/components/MemberCard.vue";

const props = defineProps({
  members:{
    type: Array,
    default: () => []
  },
  clickable:{
    type:Boolean,
    default:false
  }
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
      <header class="card-header">
        <i class="fas fa-users icon-bg-blue"></i>
        <h2 class="card-title">구성원</h2>
      </header>
      <div class="members-content">
        <div v-if="members.length === 0" class="empty-state">
          <i class="fas fa-user-friends icon-bg-blue"></i>
          <p>구성원이 없습니다</p>
        </div>
        <div v-else>
          <MemberCard v-for = "member in members" :member = "member" @click="clickEvent" :clickable="clickable"/>
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

.icon-bg-blue {
  color: var(--blue-450);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--font-main);
}

.members-content {
  height: 100%
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