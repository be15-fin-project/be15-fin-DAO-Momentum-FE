<script setup>
defineProps({
  name:{
    type:String,
    default:'회사명'
  },
  chairman:{
    type:String,
    default: '회사 대표'
  },
  employeeCount:{
    type:Number,
    default:0
  }
})
</script>

<template>
  <router-link class="main-header" to="/company/company-info">
    <!-- 회사 프로필 배너 -->
    <div class="company-banner">
      <div class="company-banner-content">
        <div class="company-info">
          <div class="company-icon">
            <i class="fas fa-building"></i>
          </div>
          <div class="company-text">
            <h1 class="company-name">{{ name }}</h1>
            <p class="company-meta">{{ chairman+', '+employeeCount+'명' }}</p>
          </div>
        </div>
        <div class="company-arrow">
          <i class="fas fa-arrow-right"></i>
        </div>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.company-banner {
  background: linear-gradient(to right, #e5e7eb, #d1d5db); /* from-gray-200 to-gray-300 */
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.company-banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.company-icon {
  width: 64px;
  height: 64px;
  background: var(--icon-gradient);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.company-icon i {
  color: #ffffff;
  font-size: 1.5rem;
}

.company-text .company-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937; /* text-gray-800 */
  margin: 0;
}

.company-text .company-meta {
  color: #4b5563; /* text-gray-600 */
  margin: 4px 0 0 0;
}

.company-arrow {
  background: #fff;
  padding: 12px;
  border-radius: 9999px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.company-arrow i {
  color: #4b5563;
}

</style>