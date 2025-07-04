<script setup>
defineProps({
  icon:String,
  iconClass:String,
  label:String,
  value:String,
  badge:String,
  badgeClass:String
});
</script>

<template>
  <div class="company-card">
    <div :class="'company-card-icon '+iconClass">
      <i :class=icon></i>
    </div>
    <p class="company-card-label">{{ label }}</p>
    <p class="company-card-value">{{value}}</p>
<!--    <div :class="'company-badge '+badgeClass">{{ badge }}</div>-->
  </div>
</template>

<style scoped>
/* Company Info Cards */


.company-card {
  background: white;
  border: 2px solid #e5e7eb;
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.company-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.company-card:hover::before {
  left: 100%;
}

.company-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(99, 102, 241, 0.1);
  border-color: #6366f1;
}

.company-card-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
}

.company-card-icon.icon-gradient {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.company-card-icon.purple-gradient {
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
}

.company-card-icon.green-gradient {
  background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
}

.company-card-icon i {
  color: white;
  font-size: 20px;
}

.company-card-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 8px;
}

.company-card-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.company-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.green-badge {
  background: #d1fae5;
  color: #065f46;
}

.blue-badge {
  background: #dbeafe;
  color: #1e3a8a;
}

.orange-badge {
  background: #fed7aa;
  color: #9a3412;
}
</style>