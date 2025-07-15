<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  tabs: {
    type: Array,
    required: true
  },
  selected: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:selected', 'tab-click'])

const currentSelected = ref(props.selected)

watch(() => props.selected, (newVal) => {
  currentSelected.value = newVal
})

function selectTab(value) {
  emit('update:selected', value)
  emit('tab-click', value)
}

</script>

<template>
  <nav class="tab-nav">
    <div class="tab-nav-container">
      <div class="tab-list">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-button', { active: tab.value === currentSelected }]"
          @click="selectTab(tab.value)"
        >
          <i :class="['fas', tab.icon]"></i>
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>
  </nav>
</template>


<style scoped>
.tab-nav {
  padding: 0 3rem;
  margin-top: 12px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 5px 0px;
  margin-bottom : 2rem;
}

.tab-list {
  display: flex;
  gap: 16px;

}

.tab-button {
   font-size: 0.875rem;
   font-weight: 500;
   color: rgb(107, 114, 128);
   display: flex;
   align-items: center;
   cursor: pointer;
   padding: 16px;
   background: none;
   border-width: initial;
   border-style: none;
   border-color: initial;
   border-image: initial;
   gap: 8px;
   transition: color 0.2s;
}

.tab-button i {
  font-size: 14px;
}

.tab-button.active {
  color: rgb(37, 99, 235);
  border-bottom: 2px solid rgb(37, 99, 235);
}

.tab-button i {
  font-size: 14px;
}
</style>
