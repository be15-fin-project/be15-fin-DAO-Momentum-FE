<template>
  <main class="body-content">

    <main>
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="neon-circle-bg"></div>
        <div class="fluid-bg"></div>
        <div class="hero-content">
          <div class="floating">
            <div class="hero-logo">
              <img src="@/assets/icons/logo_light.png" alt="로고"/>
            </div>
            <p class="hero-name">
              Momentum
            </p>
            <H3 class="hero-title">
              인사 관리 플랫폼에서 근속 예측까지
            </H3>
            <p class="hero-subtitle">
                구성원의 작은 변화 신호를 읽어내어 근속 가능성을 예측하는 통합 HR 솔루션
            </p>
            <div class="button-wrap">
              <router-link to="/login" class="btn button-login">
                <i class="fas fa-sign-in-alt"/> 로그인
              </router-link>

            </div>
          </div>
<!--          <div class="glass card neon-glow">-->
<!--            <div class="card-grid">-->
<!--              <div class="brand-sub">-->
<!--                Momentum 워크스페이스 만들기-->
<!--              </div>-->
<!--              <div class="brand-sub">-->
<!--                우리 조직만의 HR 관리 환경을 구성해보세요-->
<!--              </div>-->
<!--            </div>-->
<!--            <div class="icon-grid">-->
<!--              <i class="fas fa-sign-in-alt"/>-->
<!--            </div>-->
<!--          </div>-->
        </div>
      </section>

      <!-- Features Section -->
      <section class="story-section">
        <div class="section-header">
          <h1 class="section-title holographic-text">혁신적인 6가지 핵심 기능</h1>
          <p class="section-subtitle">각각의 기능이 조화롭게 연결되어 완벽한 HR 생태계를 구축합니다</p>
        </div>

        <div class="grid-container">
          <FeatureCard
              v-for="feature in features"
              :key="feature.title"
              :feature="feature"
          />
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="cta-card">
          <h2 class="cta-title holographic-text">
            조직의 진짜 변화는<br>사람을 이해하는 것에서 시작됩니다
          </h2>
          <p class="cta-sub">Momentum과 함께 시작하세요</p>
          <div class="cta-buttons">
            <router-link to="/login" class="cta-button">
              <i class="fas fa-sign-in-alt"></i> 로그인
            </router-link>
          </div>
        </div>
      </section>
    </main>
  </main>
</template>

<script>
import FeatureCard from '@/features/common/components/FeatureCard.vue';

export default {
  components: {FeatureCard},
  data() {
    return {
      features: [
        {
          badge: 'Smart',
          icon: 'fas fa-users-cog',
          title: '스마트 인사관리',
          description: 'AI 기반 조직도 자동 연동과 권한별 접근 제어로 <br>체계적인 인사관리를 실현합니다',
          points: ['조직도 자동 연동', '권한별 접근 제어', '계약/발령 통합 관리'],
          vizType: 'bar',
        },
        {
          badge: 'AI',
          icon: 'fas fa-clock',
          title: '지능형 근태시스템',
          description: 'IP 기반 출퇴근 제한과 패턴 분석으로 <br>정확하고 스마트한 근태 관리를 제공합니다',
          points: ['출퇴근 기능 제공', '자동 근태 집계', '이상 패턴 감지'],
          vizType: 'pattern',
        },
        {
          badge: 'Flow',
          icon: 'fas fa-route',
          title: '디지털 결재 워크플로우',
          description: '맞춤형 결재선 구성과 실시간 처리 현황으로 <br>효율적인 업무 프로세스를 구축합니다',
          points: ['맞춤형 결재선 구성', '실시간 처리 현황', '자동 알림 연동'],
          vizType: 'approval',
        },
        {
          badge: '360°',
          icon: 'fas fa-brain',
          title: '성과평가 혁신',
          description: 'KPI 실시간 추적과 360도 다면평가로 <br>공정하고 투명한 성과 관리를 실현합니다',
          points: ['KPI 진척도 실시간 추적', '360도 다면평가', '투명한 등급 산출'],
          vizType: 'progress',
        },
        {
          badge: 'Care',
          icon: 'fas fa-heart',
          title: '근속지원 시스템',
          description: '이탈 위험도 분석과 선제적 개입으로 <br>소중한 인재를 지키는 스마트한 케어 시스템입니다',
          points: ['이탈 위험도 분석', '자동 면담 요청', '맞춤형 개입 방안'],
          vizType: 'pie',
        },
        {
          badge: 'Connect',
          icon: 'fas fa-comments',
          title: '통합 커뮤니케이션',
          description: '실시간 알림 시스템과 AI 챗봇으로 <br>원활한 소통과 즉시 지원을 제공합니다',
          points: ['실시간 알림 시스템', 'AI 챗봇 상담', '공지사항 관리'],
          vizType: 'status',
        }
      ]
    }
  }
}
</script>

<style scoped>
.body-content {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  background: radial-gradient(ellipse at center,
  #15161f 0%, /* 중심: 아주 짙은 네이비 */ #1a1b2b 40%, /* 중간: 약간 보라 섞인 남색 */ #202136 100%); /* 바깥: 부드러운 어두운 남색 */
  color: #ffffff;
  font-size: 1.2rem;
}


.hero-section {
  position: relative;
  min-height: 130vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2.4rem;
  overflow: hidden;
}

.neon-circle-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 820px;
  height: 820px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle at center,
  rgba(139, 92, 246, 0.35),
  rgba(147, 51, 234, 0.15),
  rgba(0, 0, 0, 0) 75%);
  box-shadow: 0 0 60px rgba(147, 51, 234, 0.5),
  0 0 120px rgba(139, 92, 246, 0.4),
  0 0 180px rgba(139, 92, 246, 0.2);
  filter: blur(40px);
  z-index: 0;
  animation: pulse-glow 8s ease-in-out infinite;
}


@keyframes pulse-glow {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.9;
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
}

.hero-content {
  animation: fadeInUp 1.2s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


.hero-logo {
  margin-bottom: 1.2rem;
  display: flex;
  justify-content: center;
  animation: floating 6s ease-in-out infinite; /* 글자랑 같이 둥둥 */
}

.hero-logo img {
  width: 240px;
  height: auto;
  object-fit: contain;
}

.hero-name {
  font-size: 2.7rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.hero-title {
  font-size: 3.6rem;
  font-weight: bold;
  margin-bottom: 1.8rem;
}

.hero-subtitle {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.5rem;
  margin-bottom: 2.4rem;
  color: #cbd5e1;
  gap: 1rem;
}

.button-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  padding-top: 3rem;
}

.btn {
  font-size: 20px;
  padding: 10px 50px;
  letter-spacing: 0px;
}

.button-login {
  display: inline-flex;
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  padding: 1.2rem 4rem;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
  transition: all 0.3s ease;
  color: var(--color-surface);
  gap: 0.6rem;
}

.button-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(124, 58, 237, 0.6);
}

.card {
  display: flex;
  align-items: center;
  padding: 2.4rem;
  border-radius: 1.8rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-grid {
  padding: 1rem 5rem;
  border-radius: 1.8rem;
}

.icon-grid {
  display: flex;
  margin: auto;
  font-size: 60px;
}

.brand-title {
  font-size: 2.4rem;
  font-weight: 700;
  background: linear-gradient(45deg, #ff006e, #8338ec, #3a86ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-sub {
  margin-top: 0.6rem;
  color: #e2e8f0;
}

.holographic-text {
  background: var(--color-surface);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: holographic 4s ease-in-out infinite;
}

@keyframes holographic {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.floating {
  animation: floating 6s ease-in-out infinite;
}

@keyframes floating {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-24px);
  }
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 3rem;
  padding: 4rem 25rem;
}

.story-section {
  padding: 1.2rem 2.4rem;
}

.section-header {
  display: flex;
  text-align: center;
  flex-direction: column;
  margin-bottom: 2.4rem;
  gap: 1.2rem;
}

.section-title {
  font-size: 3rem;
  font-weight: bold;
}

.section-subtitle {
  color: #cbd5e1;
  font-size: 1.4rem;
  margin-bottom: 3.6rem;
}

.cta-section {
  padding: 10rem 2.4rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cta-card {
  max-width: 840px;
  padding: 3.6rem 4.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1.8rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
}

.cta-title {
  font-size: 2.4rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
}

.cta-sub {
  font-size: 1.5rem;
  margin-bottom: 2.4rem;
  color: #cbd5e1;
}

.cta-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  justify-content: center;
}

.cta-button {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-surface);
  border: none;
  border-radius: 2.4rem;
  padding: 0.9rem 1.8rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.cta-button:hover {
  transform: scale(1.05);
}
</style>