<template>
  <div class="card profile-card">
    <div class="profile-avatar">
      <div class="avatar-circle">
        <i class="fas fa-user"></i>
      </div>
      <div class="status-indicator"></div>
    </div>

    <h2 class="profile-name">{{ name }}</h2>
    <p class="profile-position">{{ position }}</p>

    <div class="profile-badges">
      <span class="status-badge">{{ status }}</span>
      <span class="department-badge">{{ department }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: String,
  position: String,
  status: String,
  department: String
})
</script>

<style scoped>
.profile-card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 24px;
  margin-top: 12px;
  text-align: center;
  overflow: hidden;
}

.profile-avatar {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
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

.status-indicator {
  position: absolute;
  bottom: 16px;
  right: -4px;
  width: 24px;
  height: 24px;
  background: #10b981;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39);
}

.profile-name {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.profile-position {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 24px;
}

.profile-badges {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
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
</style>
