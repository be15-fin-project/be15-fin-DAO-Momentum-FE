<template>
    <div class="content-sections">
      <div>
        <SectionHeader :icon-class="'fas fa-graduation-cap'" :title="'학력'"/>
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
import InfoTable from "@/features/mypage/components/InfoTable.vue";
import SectionHeader from "@/features/mypage/components/SectionHeader.vue";
import {onMounted, reactive} from "vue";

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
</style>