<template>
    <div class="content-sections">
      <div>
        <div class = "first-header">
        <SectionHeader :icon-class="'fas fa-graduation-cap'" :title="'학력'"/>
        <BaseButton :icon="'fas fa-edit'" :variant="'edit'" @click="openModal">이력정보 수정</BaseButton>
        </div>
        <InfoTable
            :headers="dataMap.EDUCATION.headers"
            :rows="dataMap.EDUCATION.rows"
        />
      </div>
      <div>
        <SectionHeader :icon-class="'fas fa-certificate'" :title="'자격증'"/>
        <InfoTable
            :headers="dataMap.CERTIFICATE.headers"
            :rows="dataMap.CERTIFICATE.rows"
        />
      </div>

    <div>
      <SectionHeader :icon-class="'fas fa-award'" :title="'수상이력'"/>
      <InfoTable
          :headers="dataMap.AWARD.headers"
          :rows="dataMap.AWARD.rows"
      />
    </div>

      <div >
        <SectionHeader :icon-class="'fas fa-briefcase'" :title="'경력'"/>
        <InfoTable
            :headers="dataMap.CAREER.headers"
            :rows="dataMap.CAREER.rows"
        />
      </div>
    </div>
</template>

<script setup>
import InfoTable from "@/features/mypage/components/profile/InfoTable.vue";
import SectionHeader from "@/features/mypage/components/profile/SectionHeader.vue";
import {onMounted, reactive} from "vue";
import BaseButton from "@/components/common/BaseButton.vue";

const emit = defineEmits(['openModal'])

const openModal = (() => {
  emit('openModal')
})

//enum('EDUCATION','CERTIFICATE','AWARD','CAREER')
const dataMap = reactive({
  EDUCATION: {
    headers: ['학교명','학과','기간'],
    rows: []
  },
  CERTIFICATE: {
    headers: ['자격증명', '발급 기관', '취득 시기'],
    rows: []
  },
  AWARD: {
    headers: ['수상명', '수상 기관', '수상 시기'],
    rows: []
  },
  CAREER: {
    headers: ['근무지', '기간'],
    rows: []
  }
})

const props = defineProps({
      info: Object
    }
);

/*
    private long empId;
    private RecordType type;
    private String organization;
    private LocalDate startDate;
    private LocalDate endDate;
    private String name;
 */

onMounted(() => {
  props.info.forEach(item => {
    switch (item.type) {
      case 'EDUCATION':
        dataMap.EDUCATION.rows.push([
          item.organization,
          item.name,
          item.startDate+' ~ '+item.endDate
        ])
        break
      case 'CERTIFICATE':
        dataMap.CERTIFICATE.rows.push([
          item.name,
          item.organization,
          item.startDate
        ])
        break
      case 'AWARD':
        dataMap.AWARD.rows.push([
          item.name,
          item.organization,
          item.startDate
        ])
        break
      case 'CAREER':
        dataMap.CAREER.rows.push([
          item.startDate+' ~ '+item.endDate,
          item.organization
        ])
        break
    }
  })
})
</script>

<style scoped>
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