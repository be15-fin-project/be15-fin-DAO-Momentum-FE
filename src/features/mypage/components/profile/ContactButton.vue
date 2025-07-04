<template>
  <div class="contact-button tooltip">
    <div class="contact-content" >
      <div class="contact-icon">
        <i :class="icon"></i>
      </div>
      <div class="contact-info">
        <p class="contact-label">{{ label }}</p>
        <p class="contact-value">{{ value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: String,
  value: String,
  icon: String,
  type: { type: String, default: 'email' }
});
</script>


<style scoped>
/* Contact Section */
.contact-section {
  margin-bottom: 32px;
}

.contact-button {
  background: white;
  border: 2px solid #e5e7eb;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
}

.contact-button:hover {
  background: #f9fafb;
  border-color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.contact-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contact-icon {
  width: 40px;
  height: 40px;
  background: var(--icon-gradient);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-icon i {
  color: white;
}

.contact-info {
  flex: 1;
  text-align: left;
}

.contact-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
}

.contact-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}
</style>