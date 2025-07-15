<template>
  <div class="feature-card">
    <div class="premium-badge">{{ feature.badge }}</div>
    <div class="feature-icon">
      <i :class="feature.icon"></i>
    </div>
    <h3 class="feature-title">{{ feature.title }}</h3>
    <p class="feature-description" v-html="feature.description"></p>
    <div class="feature-tags">
  <span v-for="point in feature.points" :key="point" class="tag">
    <i class="fas fa-check-circle"></i> {{ point }}
  </span>
    </div>

    <div class="feature-viz">
      <slot name="viz" :type="feature.vizType"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeatureCard',
  props: {
    feature: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.feature-card {
  position: relative;
  padding: 2rem;
  border-radius: 1.5rem;
  background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.3s ease;
}
.feature-card:hover {
  transform: translateY(-10px) scale(1.02);
  background: linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08));
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.2);
}
.premium-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.feature-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  background: radial-gradient(circle at center, #8338ec, #3a86ff);
  margin: 0 auto 1rem;
}
.feature-title {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0.5rem;
}
.feature-description {
  font-size: 0.95rem;
  text-align: center;
  color: #d1d5db;
  margin-bottom: 1.5rem;
}
.feature-points {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  color: #d1d5db;
  font-size: 0.9rem;
}
.feature-points li {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}
.feature-points i {
  color: #38bdf8;
  margin-right: 0.5rem;
}
.feature-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-direction: column;
}

.tag {
  display: inline-flex;
  width: 60%;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-surface); /* 거의 검정 */
  border-radius: 9999px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tag i {
  color: var(--purple-50); /* soft blue */
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.feature-viz {
  margin-top: 1rem;
  text-align: center;
}
</style>