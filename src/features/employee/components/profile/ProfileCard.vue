<template>
  <div class="profile-card">
    <div class="profile-avatar">
      <div class="avatar-circle">
        <i class="fas fa-user"></i>
      </div>
      <div class="status-indicator"></div>
    </div>

    <h2 class="profile-name">{{ name }}</h2>

    <!-- Badges -->
    <div class="profile-badges">
      <span class="status-badge">{{ status }}</span>
      <span class="department-badge">{{ department }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: String,
  status: String,
  department: String
});
</script>


<style scoped>
/* Profile Card */


.profile-card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 24px;
  margin-top: 12px;
  /*box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);*/
  text-align: center;
  /*position: relative;*/
  overflow: hidden;
}

.profile-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  /*background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);*/
}

.profile-avatar {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

.profile-badges {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.profile-name {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.avatar-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--blue-400);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.avatar-circle i {
  color: white;
  font-size: 32px;
}

.status-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39);
  animation: pulse 2s infinite;
}

.department-badge {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);
}

.info-item i {
  color: var(--blue-400);
  opacity: 0.8;
}
</style>