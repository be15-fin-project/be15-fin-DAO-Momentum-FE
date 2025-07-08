import SettingView from "@/features/settings/views/SettingView.vue";
import CompanyForm from "@/features/settings/views/CompanyForm.vue";
import DepartmentForm from "@/features/settings/views/DepartmentForm.vue";

export const settingsRoutes = [
    {
        path: '/setting',
        name: 'SettingView',
        component: SettingView,
        redirect: '/setting/company',
        children:[
            {
            path:'company',
            component: CompanyForm
            },
            {
                path:'department',
                component: DepartmentForm
            }
        ]
    },
];
