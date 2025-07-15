<template>
  <div class="glass-card">
    <!-- 상단 점수 + 등급 -->
    <div class="top-box">
      <div class="info-text">
        <div class="grade-label">
          <i :class="gradeIconClass" class="mr-1"></i>
          {{ stabilityType }}
        </div>
        <div class="status-badge">{{ retentionGrade }}</div>
      </div>
      <div class="score-circle">
        {{ retentionScore }}
      </div>
    </div>

    <!-- 평가 구간별 항목 -->
    <div class="section">
      <div
          v-for="section in gradeSections"
          :key="section.label"
          class="section-block"
      >
        <div class="section-title">
          <i :class="section.icon"></i>
          <span class="label">{{ section.label }}</span>
          <span class="sub">({{ section.range }})</span>
        </div>
        <div class="tag-list">
          <div
              v-for="tag in section.items"
              :key="tag"
              class="tag"
          >
            {{ tag }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  retentionScore: Number,        // 예: 87
  stabilityType: String,         // 예: 'SEVERE', 'GOOD', etc.
  factorGrades: Object,          // 예: { job: '탁월', comp: '양호', ... }
});

const highlightTag = '교육 기회';

// 점수 기반 등급 계산
const retentionGrade = computed(() => {
  const score = props.retentionScore ?? 0;
  if (score >= 95) return '탁월';
  if (score >= 85) return '우수';
  if (score >= 70) return '양호';
  if (score >= 60) return '주의';
  return '위험';
});

// 등급별 아이콘
const gradeIconClass = computed(() => {
  const iconMap = {
    '탁월': 'fas fa-trophy',
    '우수': 'fas fa-star',
    '양호': 'fas fa-chart-line',
    '주의': 'fas fa-circle-exclamation',
    '위험': 'fas fa-triangle-exclamation',
  };
  return iconMap[retentionGrade.value] || 'fas fa-circle';
});

// 등급별 섹션
const gradeSections = computed(() => {
  const rawMap = {
    '탁월': { icon: 'fas fa-trophy', range: '95점 이상', items: [] },
    '우수': { icon: 'fas fa-star', range: '85~94점', items: [] },
    '양호': { icon: 'fas fa-chart-line', range: '70~84점', items: [] },
    '주의': { icon: 'fas fa-circle-exclamation', range: '60~69점', items: [] },
    '위험': { icon: 'fas fa-triangle-exclamation', range: '60점 미만', items: [] },
  };

  const labelMap = {
    job: '직무 만족도',
    comp: '보상 만족도',
    relation: '관계 만족도',
    growth: '성장 만족도',
    wlb: '워라밸 만족도',
    tenure: '근속 만족도',
  };

  for (const [key, grade] of Object.entries(props.factorGrades)) {
    const label = labelMap[key] || key;
    rawMap[grade]?.items.push(label);
  }

  return Object.entries(rawMap).map(([label, value]) => ({
    label,
    ...value,
  }));
});
</script>

<style scoped>
.glass-card {
  margin: 0 2rem;
  backdrop-filter: blur(10px);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: 50px;
}

.top-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 36px;
  border-radius: var(--radius-xl);
  box-shadow: var(--card-shadow);
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: var(--color-surface);
  font-weight: 700;
  font-size: 26px;
  box-shadow: 0 4px 10px rgba(124, 58, 237, 0.3);
}

.score-circle span {
  font-size: 14px;
  margin-top: 4px;
  font-weight: 400;
}

.info-text {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.grade-label {
  font-size: 24px;
  font-weight: 600;
}

.grade-label i {
  margin-right: 6px;
  color: var(--purple-50);
}

.status-badge {
  background-color: var(--purple-10);
  color: var(--purple-500);
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 20px;
  width: fit-content;
}

.section {
  display: flex;
  flex-direction: column;
}

.section-block {
  padding: 32px 0;
  border-top: 1px solid var(--gray-200);
}

.section-block:first-child {
  border-top: none;
  padding-top: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 18px;
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 12px;
}

.section-title i {
  color: var(--blue-400);
  font-size: 18px;
}

.section-title .sub {
  font-size: 13px;
  color: var(--color-text-muted);
  font-weight: 400;
}
.tag-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tag {
  font-size: 13px;
  background-color: var(--blue-50);
  padding: 6px 14px;
  border-radius: 999px;
  color: var(--gray-550);
}

</style>
