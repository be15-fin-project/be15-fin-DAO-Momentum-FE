<script setup>

</script>

<template>
  <section class="login-visual-section">
    <div class="login-blob login-blob1"></div>
    <div class="login-blob login-blob2"></div>

    <div class="login-visual-inner">
      <div class="login-visual-logo">
        <div class="login-visual-logo-circle">
          <i class="fas fa-users"></i>
        </div>
        <div>
          <div class="login-visual-title">
            사람이 중심인<br />
            <span class="login-highlight">스마트 인사관리</span>
          </div>
          <div class="login-visual-desc">
            효율적인 인사관리로<br />더 나은 미래를 만들어갑니다
          </div>
        </div>
      </div>

      <div class="login-features-list">
        <div class="login-feature-card">
          <i class="fas fa-chart-line"></i>
          <div>
            <div class="login-feature-title">성과 평가</div>
            <div class="login-feature-desc">KPI 관리 및 다면평가</div>
          </div>
        </div>
        <div class="login-feature-card">
          <i class="fas fa-clock"></i>
          <div>
            <div class="login-feature-title">근태 관리</div>
            <div class="login-feature-desc">출퇴근 및 휴가 관리</div>
          </div>
        </div>
        <div class="login-feature-card">
          <i class="fas fa-file-signature"></i>
          <div>
            <div class="login-feature-title">전자 결재</div>
            <div class="login-feature-desc">업무 효율성 극대화</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>


<style scoped>
.login-visual-section {
  flex: 1.15;
  background: var(--icon-gradient);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 60px 32px 60px 40px;
  min-width: 410px;
  max-width: 800px;
}
@media (max-width: 1050px) {
  .login-visual-section {
    min-width: 0;
    max-width: none;
    padding: 48px 12px 48px 12px;
  }
}
@media (max-width: 820px) {
  .login-visual-section {
    width: 100vw;
    min-width: 0;
    max-width: none;
    min-height: 310px;
    height: auto;
    padding: 40px 10vw 32px 10vw;
    border-radius: 0 0 28px 28px;
  }
  @media (max-width: 600px) {
    .login-visual-section {
      padding: 32px 2vw 22px 2vw;
    }
    .login-card {
      padding: 22px 6px 14px 6px;
      border-radius: 14px;
    }
  }
}
/* Visual Slogan */
.login-visual-inner {
  z-index: 2;
  width: 100%;
  max-width: 410px;
  margin: 0 auto;
  text-align: left;
}
.login-visual-logo {
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: center;
}
.login-visual-logo-circle {
  width: 60px;
  height: 60px;
  background: rgba(255,255,255,0.13);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  box-shadow: 0 2px 10px 0 rgba(98,142,203,0.10);
  animation: login-floating 6s ease-in-out infinite;
}
.login-visual-title {
  color: #fff;
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.23;
  margin-bottom: 14px;
  margin-top: 12px;
}
.login-visual-title .login-highlight {
  color: var(--label-pending);
}
.login-visual-desc {
  color: rgba(255,255,255,0.89);
  font-size: 1.13rem;
  margin-bottom: 28px;
  font-weight: 400;
}
.login-features-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 32px;
}
.login-feature-card {
  background: rgba(255,255,255,0.97);
  border: 1px solid rgba(255,255,255,0.13);
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 13px;
  color: var(--main-color);
  box-shadow: 0 2px 14px 0 rgba(57,88,134,0.07);
  transition: transform .26s, box-shadow .26s;
}
.login-feature-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 10px 32px 0 rgba(57,88,134,0.13);
}
.login-feature-title {
  font-weight: 600;
  margin-bottom: 2px;
}
.login-feature-desc {
  font-size: 0.96rem;
  color: var(--label-color);
  opacity: 0.78;
}

/* Background blobs */
.login-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(38px);
  opacity: 0.7;
  animation: login-blob 7s infinite;
}
.login-blob1 {
  top: 12%;
  left: 12%;
  width: 190px;
  height: 190px;
  background: rgba(255, 255, 255, 0.21);
  animation-delay: -2s;
}
.login-blob2 {
  top: 62%;
  right: 12%;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.13);
  animation-delay: -4s;
}
</style>