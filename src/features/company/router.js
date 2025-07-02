import CompanyInfoView from "@/features/company/views/CompanyInfoView.vue";

export const companyRoutes = [
    {
        path: 'company',
        children: [
            {
                path: 'company-info',
                name: 'CompanyInfoView',
                component: CompanyInfoView
            }
        ]
    }
];
