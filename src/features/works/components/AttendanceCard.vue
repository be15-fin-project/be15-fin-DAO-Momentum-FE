<template>
  <div class="attendance-card">
    <!-- 헤더 -->
    <div class="header">
      <div class="icon-circle">
        <i class="fas fa-clock"></i>
      </div>
      <h2 class="title">{{ titleText }}</h2>
    </div>

    <!-- 현재 시간 -->
    <div class="time-card" v-if="mode !== 'calendar'">
      <div class="label">현재 시간</div>
      <div class="time">{{ currentTime }}</div>
      <div class="date">{{ currentDate }}</div>
      <div class="badge">
        <i class="fas fa-check-circle"></i>
        {{ mode === 'start' ? '출근 준비' : '퇴근 준비' }}
      </div>
    </div>

    <!-- 오늘의 일정 -->
    <div class="timeline">
      <div class="section-title" v-if="mode !== 'calendar'"><i class="fas fa-route"></i> 오늘의 일정</div>
      <div class="timeline-row">
        <div class="timeline-item">
          <div class="dot timeline-dot"></div>
          <div class="timeline-label">출근<br/>{{ startTime || '--:--' }}</div>
        </div>
        <div class="line shimmer-line"></div>
        <div class="timeline-item">
          <div class="dot lunch-dot"></div>
          <div class="timeline-label">점심<br/>12 : 00</div>
        </div>
        <div class="line shimmer-line"></div>
        <div class="timeline-item">
          <div class="dot leave-dot"></div>
          <div class="timeline-label">퇴근<br/>{{ endTime || '--:--' }}</div>
        </div>
      </div>
    </div>

    <!-- 요약 -->
    <div class="summary">
      <div class="summary-box work-box">
        <i class="fas fa-briefcase"></i>
        <div class="label">근무시간</div>
        <div class="value">{{ workHours }}</div>
      </div>
      <div class="summary-box break-box">
        <i class="fas fa-coffee"></i>
        <div class="label">휴게시간</div>
        <div class="value">{{ breakHours }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentTime: String,
  currentDate: String,
  startTime: String,
  endTime: String,
  workHours: String,
  breakHours: String,
  mode: {
    type: String,
    default: 'start',
    validator: (val) => ['start', 'end', 'calendar'].includes(val),
  },
})

const titleText = computed(() => {
  if (props.mode === 'calendar') return `${props.currentDate}`
  if (props.mode === 'start') return '출근 등록'
  return '퇴근 등록'
})

</script>

<style scoped>
.attendance-card {
  padding: 16px;
  width: 100%;
}

.attendance-card div {
  margin-top: 10px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.icon-circle {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 22px;
  margin: 0 auto 12px;
  box-shadow: 0 0 8px rgba(79, 70, 229, 0.5);
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.time-card {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 14px;
  padding: 16px;
  text-align: center;
  margin-bottom: 20px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.time-card div {
  margin-bottom: 8px;
}

.time-card .label {
  font-size: 14px;
  color: #6b7280;
}

.time-card .time {
  font-size: 28px;
  font-weight: bold;
  color: #1f2937;
  margin-top: 6px;
}

.time-card .date {
  font-size: 13px;
  color: #4b5563;
}

.badge {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 999px;
  margin-top: 10px;
  display: inline-block;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.timeline {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.section-title i {
  margin-right: 6px;
  color: #6366f1;
}

.timeline-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timeline-item {
  text-align: center;
}

.timeline-label {
  font-size: 12px;
  color: #4b5563;
  margin-top: 4px;
}

.dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin: 0 auto;
}

.timeline-dot {
  background: linear-gradient(45deg, #4f46e5, #7c3aed);
  box-shadow: 0 0 20px rgba(79, 70, 229, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.lunch-dot {
  background: linear-gradient(to right, #fb923c, #f87171);
  box-shadow: 0 0 8px rgba(251, 146, 60, 0.4);
}

.leave-dot {
  background: linear-gradient(to right, #34d399, #10b981);
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.4);
}

.line {
  flex: 1;
  height: 2px;
  background: #e5e7eb;
  margin: 0 10px;
  position: relative;
  overflow: hidden;
}

.shimmer-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(79, 70, 229, 0.6), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.summary {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.summary-box {
  flex: 1;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #eee;
  padding: 14px;
}

.summary-box i {
  font-size: 18px;
  margin-bottom: 4px;
  display: block;
}

.summary-box .label {
  font-size: 13px;
  color: #6b7280;
}

.summary-box .value {
  font-size: 15px;
  font-weight: bold;
  color: #1f2937;
  margin-top: 4px;
}

.work-box {
  background: linear-gradient(to bottom right, #ede9fe, #e0e7ff);
  border: 1px solid #c4b5fd;
}

.work-box i {
  color: #7c3aed;
}

.break-box {
  background: linear-gradient(to bottom right, #fff7ed, #fee2e2);
  border: 1px solid #fdba74;
}

.break-box i {
  color: #fb923c;
}
</style>
