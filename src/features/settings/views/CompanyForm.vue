<script setup>
import {onMounted, ref} from "vue";
import {putCompany} from "@/features/settings/api.js";
import {fetchCompanyInfo} from "@/features/company/api.js";
import {useToast} from "vue-toastification";

const toast = useToast()

const company = ref({
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

function handleInput(field, event) {
  company.value[field] = event.target.value
}

const submitCompany = async() => {
  try {
    const response = await putCompany(company.value);
    await getCompanyInfo();
    toast.success('회사 정보를 수정했습니다.');
  }catch(e){
    toast.error('회사 정보를 수정하지 못했습니다.');
  }
}

const getCompanyInfo = async () => {
  try{
    const response = await fetchCompanyInfo();
    company.value = response.data.companyInfoDTO;
  }catch (error){
    toast.error('회사 정보를 불러오지 못했습니다.');
  }
}

onMounted(async () => {
  await getCompanyInfo();
})

</script>

<template>
  <div class="form-card">
    <form class="form-container" @submit.prevent="submitCompany">
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


.form-card {
  background: #fff;
  border-radius: 1.6rem;
  padding: 2.4rem 2rem 2rem 2rem;
  box-shadow: 0 8px 32px rgba(56, 104, 185, 0.10);
  transition: box-shadow 0.3s;
  animation: fadeIn 0.7s cubic-bezier(0.33,1,0.68,1);
  margin-left:40px;
  margin-right:40px;
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

@media (max-width: 700px){
  .form-grid-two {
    grid-template-columns: 1fr;
  }
}
</style>