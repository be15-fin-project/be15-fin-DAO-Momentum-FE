<template>
  <div class="card doc-card">
    <div class="side-section-title">
      <span class="material-icons">assignment</span>
      결재문서
    </div>
    <div class="doc-buttons">
      <button class="doc-btn">
        <span class="material-icons">hourglass_empty</span> 대기문서
      </button>
      <button class="doc-btn">
        <span class="material-icons">check_circle</span> 처리문서
      </button>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.doc-buttons {
  display: flex;
  gap: 14px;
  margin-top: 18px;
}

.doc-btn {
  flex: 1;
  padding: 13px 0;
  border: none;
  background: var(--blue-100);
  color: var(--blue-400);
  font-weight: 700;
  border-radius: 10px;
  font-size: 14.6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  letter-spacing: -0.2px;
  box-shadow: 0 1.5px 6px 0 rgba(69, 111, 230, 0.06);
  transition: background 0.16s, color 0.18s, box-shadow 0.18s;
}

.doc-btn .material-icons {
  font-size: 1.19em !important;
  vertical-align: middle;
}

.doc-btn:hover {
  background: var(--blue-400);
  color: #fff;
  box-shadow: 0 5px 18px 0 rgba(69, 111, 230, 0.13);
  transform: translateY(-1px) scale(1.01);
}

.side-section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--blue-400);
  font-size: 1.06rem;
  font-weight: 700;
  margin-bottom: 18px;
  margin-top: 0;
}
</style>
