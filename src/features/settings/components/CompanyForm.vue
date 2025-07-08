<script setup>
import {reactive, ref, watch} from "vue";

const props = defineProps({
  currentCompany:{
    type: Object,
    default: () => {}
  },
})

const company = reactive({
  name: '',
  chairman: '',
  address: '',
  establishDate: '',
  contact: '',
  businessRegistrationNumber: '',
  email: '',
  workStartTime: '',
  paymentDay: ''
})

watch(() => props.currentCompany, (newVal) => {
  if (newVal) {
    Object.assign(company, newVal)
  }
}, { immediate: true })

const emit = defineEmits(['submit'])

function handleInput(field, event) {
  company[field] = event.target.value
}

const handleSubmit = () => {
  emit('submit', company);
}
</script>

<template>
  <div class="form-card">
    <form class="form-container" @submit.prevent="handleSubmit">
      <div class="form-grid form-grid-two">
        <div class="form-field">
          <label class="form-label"><i class="fas fa-building label-icon icon-indigo"></i>회사명</label>
          <input type="text" class="form-input" placeholder="회사명을 입력하세요" required :value="company.name" @input="handleInput('name', $event)">
        </div>
        <div class="form-field">
          <label class="form-label"><i class="fas fa-user-tie label-icon icon-purple"></i>회사 대표</label>
          <input type="text" class="form-input" placeholder="대표자명을 입력하세요" required :value="company.chairman" @input="handleInput('chairman', $event)">
        </div>
      </div>
      <div class="form-field full-width">
        <label class="form-label"><i class="fas fa-map-marker-alt label-icon icon-indigo"></i>회사 주소</label>
        <input type="text" class="form-input" placeholder="주소를 입력하세요" required :value="company.address" @input="handleInput('address', $event)">
      </div>
      <div class="form-grid form-grid-two">
        <div class="form-field">
          <label class="form-label"><i class="fas fa-calendar-alt label-icon icon-indigo"></i>설립일</label>
          <input type="date" class="form-input" required :value="company.establishDate" @input="handleInput('establishDate', $event)">
        </div>
        <div class="form-field">
          <label class="form-label"><i class="fas fa-phone label-icon icon-purple"></i>회사 연락처</label>
          <input type="tel" class="form-input" placeholder="전화번호를 입력하세요" required :value="company.contact" @input="handleInput('contact', $event)">
        </div>
      </div>
      <div class="form-grid form-grid-two">
        <div class="form-field">
          <label class="form-label"><i class="fas fa-id-card label-icon icon-indigo"></i>사업자등록번호</label>
          <input type="text" class="form-input" placeholder="000-00-00000" required :value="company.businessRegistrationNumber" @input="handleInput('businessRegistrationNumber', $event)">
        </div>
        <div class="form-field">
          <label class="form-label"><i class="fas fa-envelope label-icon icon-purple"></i>회사 이메일</label>
          <input type="email" class="form-input" placeholder="company@example.com" required :value="company.email" @input="handleInput('email', $event)">
        </div>
      </div>
      <div class="form-grid form-grid-two">
        <div class="form-field">
          <label class="form-label"><i class="fas fa-clock label-icon icon-indigo"></i>출근 시간</label>
          <input type="time" class="form-input" :value="company.workStartTime" required @input="handleInput('workStartTime', $event)">
        </div>
        <div class="form-field">
          <label class="form-label"><i class="fas fa-clock label-icon icon-purple"></i>월급일</label>
          <input type="text" class="form-input" :value="company.paymentDay" required @input="handleInput('paymentDay', $event)">
        </div>
      </div>
      <div class="button-container">
        <button type="submit" class="save-button"><i class="fas fa-save"></i>저장하기</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  position: relative;
}
.form-label {
  font-size: 1.04rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.65rem;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}
.label-icon {
  font-size: 1.1rem;
  opacity: 0.85;
}
/* 아이콘 색상 */
.icon-purple { color: #8541c6; }
.icon-indigo { color: #6366f1; }

.form-input {
  width: 100%;
  padding: 0.85rem 1.05rem;
  border: 1.5px solid #dde4f1;
  border-radius: 0.6rem;
  font-size: 1.07rem;
  background: #f7fafe;
  color: #223040;
  font-weight: 400;
  box-shadow: 0 2px 10px 0 rgba(170,190,250,.04);
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.19s;
}
.form-input:focus {
  border-color: #6d9be7;
  box-shadow: 0 6px 26px rgba(120, 127, 245, 0.12);
  background: #fff;
}
/* 라벨 애니메이션 */
.floating-label {
  color: #6d9be7 !important;
  transform: scale(0.98);
}


.form-card {
  background: #fff;
  border-radius: 1.6rem;
  padding: 2.4rem 2rem 2rem 2rem;
  box-shadow: 0 8px 32px rgba(56, 104, 185, 0.10);
  margin-bottom: 2.5rem;
  transition: box-shadow 0.3s;
  animation: fadeIn 0.7s cubic-bezier(0.33,1,0.68,1);
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.form-grid {
  display: grid;
  gap: 2rem;
}
.form-grid-two {
  grid-template-columns: repeat(2, 1fr);
}
.full-width {
  grid-column: 1/-1;
}

/* 버튼 */
.button-container {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
}
.save-button {
  background: var(--icon-gradient);
  color: #fff;
  padding: 0.9rem 2.3rem;
  border-radius: 0.7rem;
  font-weight: 600;
  border: none;
  font-size: 1.08rem;
  cursor: pointer;
  transition: all 0.18s;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  box-shadow: 0 2px 10px rgba(136, 71, 216, 0.09);
}
.save-button:hover, .save-button:focus {
  background: linear-gradient(90deg, #2955a7 0%, #6a25b1 100%);
  transform: scale(1.045);
  box-shadow: 0 8px 28px rgba(56, 104, 185, 0.13);
}

/* info cards */
.info-cards {
  display: grid;
  gap: 2rem;
  margin-top: 2rem;
  grid-template-columns: repeat(3,1fr);
}
@media (max-width: 900px){
  .info-cards { grid-template-columns: 1fr; }
}

.info-card {
  background: #fff;
  border-radius: 1.2rem;
  padding: 2rem 1.2rem;
  text-align: center;
  box-shadow: 0 2px 18px 0 rgba(120, 127, 245, 0.09);
  animation: fadeIn 0.7s cubic-bezier(0.33,1,0.68,1);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.info-card-icon {
  width: 3.1rem;
  height: 3.1rem;
  border-radius: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 1.05rem 0;
  font-size: 1.55rem;
  box-shadow: 0 2px 8px 0 rgba(56, 104, 185, 0.08);
}
.icon-bg-blue {
  background: #e9f2fe;
  color: #3868b9;
}
.icon-bg-purple {
  background: #f6eaff;
  color: #8847d8;
}
.icon-bg-green {
  background: #e8f9ef;
  color: #10b981;
}
.card-title {
  font-weight: 700;
  color: #3b4454;
  margin-bottom: 0.4rem;
  margin-top: 0;
  font-size: 1.15rem;
  letter-spacing: -0.01em;
}
.card-value {
  font-size: 2.15rem;
  font-weight: bold;
  margin: 0;
  letter-spacing: 0.01em;
}
.value-blue { color: #3868b9; }
.value-purple { color: #8847d8; }
.value-green { color: #10b981; }

@media (max-width: 700px){
  .form-grid-two {
    grid-template-columns: 1fr;
  }
}


</style>