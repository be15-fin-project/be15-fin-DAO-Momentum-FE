<template>
  <section class="form-section">
    <div class="section-header">
      <div class="section-icon">
        <i :class="['fas', icon]"></i>
      </div>
      <h3 class="section-title">{{ title }}</h3>
    </div>
    <div class="form-grid two-column">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: 'fa-circle-info' },
})
</script>

<style scoped>
.form-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f5f9;
  position: relative;
}

.section-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: var(--icon-gradient);
  border-radius: 1px;
}

.section-icon {
  width: 44px;
  height: 44px;
  background: var(--icon-gradient);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.form-grid {
  display: grid;
  gap: 24px;
}

.form-grid.two-column {
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .form-grid.two-column {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
