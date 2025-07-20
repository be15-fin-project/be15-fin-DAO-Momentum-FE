<script setup>

</script>

<template>
  <div class="unauthorized-container">
    <div class="unauthorized-message">
      <i class="fas fa-lock"></i>
      <div class="text">
        접근 권한이 없습니다.
      </div>
    </div>
  </div>
</template>

<style scoped>
.unauthorized-container {
  height: 100%;
  display: flex;
  align-items: center;
  background: var(--gray-100);
  justify-content: center;
  padding: 2rem;
}

.unauthorized-message {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  color: var(--gray-400);
  text-align: center;
  gap: 16px;
}

.unauthorized-message i {
  font-size: 2rem;
  color: var(--gray-400);
}
</style>