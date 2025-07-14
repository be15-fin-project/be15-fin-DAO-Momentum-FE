<script setup>
import {ref, onMounted} from 'vue'
import '@/assets/css/index.css'
import {fetchCompanyInfo} from "@/features/company/api.js";

const company = ref({})

const getCompanyInfo = async () => {
  try{
    const response = await fetchCompanyInfo();
    company.value = response.data.companyInfoDTO;
  }catch (error){
    console.error('회사 정보 불러오기 실패:', error);
  }
}

onMounted(async () => {
  await getCompanyInfo();
})
</script>

<template>
  <main class="main">
      <div class="container">
        <div class="header-section">
          <div class="header-content">
            <div class="header-logo">
              <i class="fas fa-building"></i>
            </div>
            <div>
              <h1 class="header-title">회사 기본 정보</h1>
            </div>
          </div>
        </div>

        <div class="form-card">
          <div class="form-container">
            <div class="form-grid form-grid-two">
              <div class="form-field">
                <label class="form-label"><i class="fas fa-building label-icon icon-indigo"></i>회사명</label>
                <p class="form-display">{{ company.name }}</p>
              </div>
              <div class="form-field">
                <label class="form-label"><i class="fas fa-user-tie label-icon icon-purple"></i>회사 대표</label>
                <p class="form-display">{{ company.chairman }}</p>
              </div>
            </div>

            <div class="form-field full-width">
              <label class="form-label"><i class="fas fa-map-marker-alt label-icon icon-indigo"></i>회사 주소</label>
              <p class="form-display">{{ company.address }}</p>
            </div>

            <div class="form-grid form-grid-two">
              <div class="form-field">
                <label class="form-label"><i class="fas fa-calendar-alt label-icon icon-indigo"></i>설립일</label>
                <p class="form-display">{{ company.establishDate }}</p>
              </div>
              <div class="form-field">
                <label class="form-label"><i class="fas fa-phone label-icon icon-purple"></i>회사 연락처</label>
                <p class="form-display">{{ company.contact }}</p>
              </div>
            </div>

            <div class="form-grid form-grid-two">
              <div class="form-field">
                <label class="form-label"><i class="fas fa-id-card label-icon icon-indigo"></i>사업자등록번호</label>
                <p class="form-display">{{ company.businessRegistrationNumber }}</p>
              </div>
              <div class="form-field">
                <label class="form-label"><i class="fas fa-envelope label-icon icon-purple"></i>회사 이메일</label>
                <p class="form-display">{{ company.email }}</p>
              </div>
            </div>

            <div class="form-grid form-grid-two">
              <div class="form-field">
                <label class="form-label"><i class="fas fa-clock label-icon icon-indigo"></i>출근 시간</label>
                <p class="form-display">{{ company.workStartTime }}</p>
              </div>
              <div class="form-field">
                <label class="form-label"><i class="fas fa-clock label-icon icon-purple"></i>월급일</label>
                <p class="form-display">{{ company.paymentDay }}일</p>
              </div>
            </div>
          </div>
        </div>

        <div class="info-cards">
          <div class="info-card">
            <div class="info-card-icon icon-bg-blue"><i class="fas fa-users"></i></div>
            <h3 class="card-title">직원 수</h3>
            <p class="card-value value-blue">{{ company.employeeCount }}명</p>
          </div>
          <div class="info-card">
            <div class="info-card-icon icon-bg-purple"><i class="fas fa-calendar"></i></div>
            <h3 class="card-title">설립 연수</h3>
            <p class="card-value value-purple">{{ company.foundedYears }}년</p>
          </div>
          <div class="info-card">
            <div class="info-card-icon icon-bg-green"><i class="fas fa-chart-line"></i></div>
            <h3 class="card-title">부서 수</h3>
            <p class="card-value value-green">{{ company.deptCount }}개</p>
          </div>
        </div>
      </div>
  </main>
</template>

<style scoped>

.container {
  max-width: none;
  width: 100%;
  padding-left: 40px;
  padding-right:40px;
}

/* 헤더 영역 */
.header-section {
  margin-bottom: 2.5rem;
}
.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.header-logo {
  width: 3.5rem;
  height: 3.5rem;
  background: var(--icon-gradient);
  border-radius: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 18px rgba(120, 127, 245, 0.08);
}
.header-logo i {
  color: #fff;
  font-size: 2rem;
}
.header-title {
  font-size: 2.1rem;
  font-weight: 700;
  color: #334155;
  margin: 0 0 0.2rem 0;
}

/* 카드 및 폼 */
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
@media (max-width: 700px){
  .form-grid-two {
    grid-template-columns: 1fr;
  }
}

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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(22px);}
  to { opacity: 1; transform: translateY(0);}
}

/* 모바일 */
@media (max-width: 600px) {
  .container { padding: 1rem 0.4rem 2rem 0.4rem; }
  .form-card { padding: 1.15rem 0.7rem 1.1rem 0.7rem;}
  .info-card {padding: 1.3rem 0.6rem;}
  .header-title { font-size: 1.36rem;}
  .form-label { font-size: 0.97rem;}
}
.form-display {
  font-size: 1.05rem;
  color: #334155;
  padding: 0.6rem 0.2rem;
}
</style>
