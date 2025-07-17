<template>
    <div class="content-sections">
      <div>
        <div>
          <div class = "first-header">
            <SectionHeader :icon-class="'fas fa-id-card'" :title="'개인 정보'"/>
            <BaseButton :icon="'fas fa-edit'" :variant="'edit'" @click="openModal">정보 수정</BaseButton>
          </div>
          <InfoTable :headers = "personalInfo.headers" :rows="personalInfo.rows" />
        </div>
      </div>
      <div>
        <SectionHeader :icon-class="'fas fa-address-book'" :title="'연락 정보'"/>
        <InfoTable :headers="contactInfo.headers" :rows="contactInfo.rows" />
      </div>
      <div>
        <SectionHeader :icon-class="'fas fa-building'" :title="'회사 정보'"/>
        <div class="company-cards">
          <CompanyCard
              icon="fas fa-calendar-alt"
              iconClass="green-gradient"
              label="입사일"
              :value="info.joinDate"
          />
          <CompanyCard
              icon="fas fa-users"
              iconClass="purple-gradient"
              label="소속 부서"
              :value="info.deptName"
          />

        </div>
      </div>
    </div>
</template>

<script setup>
import InfoTable from "@/features/mypage/components/profile/InfoTable.vue";
import CompanyCard from "@/features/mypage/components/profile/CompanyCard.vue";
import SectionHeader from "@/features/mypage/components/profile/SectionHeader.vue";
import {computed, watch} from "vue";
import BaseButton from "@/components/common/BaseButton.vue";

const props = defineProps({
      info: Object
    }
);

const emit = defineEmits(['openModal'])

const personalInfo = computed(() => ({
  headers: ['항목', '정보'],
  rows:[
      ['사번', props.info.empNo],
      ['성명', props.info.name],
      ['직위', props.info.positionName],
      ['성별', (props.info.gender==='M')?'남':'여']
  ]
}))

const contactInfo = computed(() => ({
  headers: ['연락 방법', '정보'],
  rows:[
    ['이메일',props.info.email],
    ['전화번호', props.info.contact],
    ['주소', props.info.address]
  ]
}))

const openModal = (() => {
  emit('openModal')
})

</script>

<style scoped>
.company-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(420px, 1fr));
  gap: 24px;
}
.content-sections {
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.first-header{
  display: flex;
  flex-direction: row;
  justify-content: space-between; /* 양 끝 정렬 */
  align-items: center;            /* 세로 중앙 정렬 */
}
</style>