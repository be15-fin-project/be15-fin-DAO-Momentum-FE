<script setup>
const props =defineProps({
  member:{
    type: Object,
    default: () => {}
  },
  clickable:{
    type:Boolean,
    default:false
  }
})

const emit = defineEmits(['click'])

function clickCard(){
  if(props.clickable){
    emit('click',props.member.empId)
  }
}
</script>

<template>
  <div
      :key="member.empId"
      :class="['member-item', { manager: member.deptHead }, {clickable:clickable}]"
      @click="clickCard"
  >
    <div v-if="member.deptHead" class="manager-badge">팀장</div>
    <div class="member-header">
      <div :class="['member-avatar', { manager: member.deptHead }]"></div>
      <div class="member-info">
        <h4 class="member-name">{{ member.name }}</h4>
        <p class="member-position">{{ member.position }}</p>
      </div>
    </div>
    <div class="member-contacts">
      <div class="member-contact">
        <i class="fas fa-envelope"></i>
        <span>{{ member.email }}</span>
      </div>
      <div class="member-contact">
        <i class="fas fa-phone"></i>
        <span>{{ member.contact }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.member-item {
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid var(--blue-100);
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 8px 12px rgba(56, 104, 185, 0.10);
}

.member-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}

.member-item.manager {
  /*background: var(--blue-200);*/
  border-color: var(--blue-400);
}

.member-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 0.875rem;
  background: var(--blue-200);
}

.member-avatar.manager {
  background: var(--blue-400);
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 700;
  color: var(--font-main);
  margin-bottom: 2px;
}

.member-position {
  color: var(--blue-400);
  font-size: 0.875rem;
  font-weight: 500;
}

.member-contacts {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.member-contact {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--font-sub);
}

.manager-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--blue-400);
  color: white;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.member-item.clickable{
  cursor: pointer
}
</style>