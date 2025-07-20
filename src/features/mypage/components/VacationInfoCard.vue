<template>
  <div class="card leave-info">
    <div class="side-section-title">
      <span class="material-icons" style="color:var(--warning);">beach_access</span>
      잔여 휴가
    </div>
    <p><strong>잔여 연차: </strong>
      <span class="remaining-days">{{ remainDayOff }}</span>
    </p>
    <p><strong>잔여 리프레시 휴가: </strong>
      <span class="remaining-days">{{ remainRefresh }}</span>
    </p>

<!--    <div class="leave-subtitle">이번달 휴가/출장 일정</div>-->
<!--    <ul class="leave-list">-->
<!--      <li v-for="(item, idx) in vacations" :key="idx">-->
<!--        {{ item.date }} - <span :style="item.colorStyle">{{ item.label }}</span>-->
<!--      </li>-->
<!--    </ul>-->
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {getRemainDayOff, getRemainRefresh} from "@/features/approvals/api.js";
import {useToast} from "vue-toastification";

const toast = useToast();

/* 잔여 휴가 수 */
const remainDayOff = ref(null);
const remainRefresh = ref(null);

defineProps({
  vacations: {
    type: Array,
    default: () => []
  }
})

/* 잔여 연차를 가져오는 함수 */
async function fetchRemainingVacation() {
  try {
    const dayOff = await getRemainDayOff();
    const refresh = await getRemainRefresh();

    remainDayOff.value = dayOff.data.data.remainingDayoffHours/8 + '일';
    remainRefresh.value = refresh.data.data.remainingRefreshDays + '일';
  } catch (err) {
    toast.error("잔여 휴가 불러오기 실패");
  }
}

onMounted(fetchRemainingVacation);
</script>

<style scoped>
.leave-info p {
  margin: 0 0 7px 0;
  font-size: 14.4px;
  color: var(--font-main);
}

.leave-info strong {
  color: var(--blue-400);
  font-weight: 600;
}

.remaining-days {
  color: var(--warning);
  font-weight: 600;
}

.leave-subtitle {
  font-size: 13.3px;
  margin-top: 12px;
  color: var(--blue-400);
  font-weight: 600;
}

.leave-list {
  padding-left: 18px;
  font-size: 13.8px;
  color: var(--font-sub);
  margin: 10px 0 0 0;
}

.leave-list li {
  margin-bottom: 2px;
  font-weight: 500;
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
