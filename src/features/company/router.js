import CompanyInfoView from "@/features/company/views/CompanyInfoView.vue";
import OrgChartView from "@/features/company/views/OrgChartView.vue";

export const companyRoutes = [
    {
        path: 'company',
        children: [
            {
                path: 'company-info',
                name: 'CompanyInfoView',
                component: CompanyInfoView
            },
            {
                path:'org-chart',
                name: 'OrgChartView',
                component: OrgChartView
            }
        ]
    }
];
