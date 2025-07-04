<template>
  <section class="form-section" :class="outerClass">
    <div class="section-header">
      <div class="section-icon">
        <i :class="['fas', icon]"></i>
      </div>
      <h3 class="section-title">{{ title }}</h3>
    </div>

    <div :class="['form-grid', layoutClass]">
      <slot />
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  title: String,
  icon: { type: String, default: 'fa-circle-info' },
  layout: { type: String, default: 'two-column' },
  outerClass: { type: [String, Object, Array], default: '' }
});

const layoutClass = props.layout || '';
</script>


<style>
.form-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--gray-100);
  position: relative;
}

.section-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 12rem;
  height: 2px;
  background: var(--icon-gradient);
  border-radius: 1px;
}

.section-icon {
  width: 44px;
  height: 44px;
  background: var(--icon-gradient);
  color: var(--color-surface);
  border-radius: var(--form-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 1.1rem;
  box-shadow: var(--form-shadow);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--font-main);
  margin: 0;
}

/* 기본 form-grid 구조 */
.form-grid {
  display: grid;
  gap: 24px;
}

/* layout: two-column */
.form-grid.two-column {
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .form-grid.two-column {
    grid-template-columns: 1fr 1fr;
  }
}

/* layout: one-column */
.form-grid.one-column {
  grid-template-columns: 1fr;
}

/* layout: three-column */
@media (min-width: 1024px) {
  .form-grid.three-column {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
