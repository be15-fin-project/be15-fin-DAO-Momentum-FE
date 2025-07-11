<script setup>
const props = defineProps({
  iconClass:String,
  title:String

});
</script>

<template>
  <div class="section-header">
    <div class="section-icon">
      <i :class=iconClass></i>
    </div>
    <h3 class="section-title">{{ title }}</h3>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--gray-100);
  position: relative;
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
  font-size: 24px;
  font-weight: 700;
  background: var(--icon-gradient);
  margin: 0;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>