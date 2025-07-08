<script setup>
const props =defineProps({
  member:{
    type: Object,
    default: () => {}
  },
  clickable:{
    type:Boolean,
    default:false
  },
  isSelected: {
    type: Boolean,
    default: false
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
      :class="['member-item', { manager: member.deptHead, clickable: clickable, selected: isSelected }]"
      @click="clickCard"
  >
    <div v-if="member.deptHead" class="manager-badge">팀장</div>
    <div class="member-header">
      <div :class="['member-avatar', { manager: member.deptHead }]">
        <i class="fas fa-user"></i>
      </div>
      <div class="member-info">
        <h4 class="member-name">{{ member.name }} <span class="emp-no">({{ member.position }})</span></h4>
        <p class="member-position">{{ member.empNo }}</p>
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

.member-item.selected {
  border: 2px solid #3b82f6;
  background-color: #eef6ff;
}

.member-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--blue-200);
}

.member-avatar.manager {
  background: var(--blue-400);
}

.member-avatar i {
  font-size: 16px;
  color: var(--color-surface);
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 0.9rem;
  font-weight: 600;
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