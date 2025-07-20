import SettingView from "@/features/settings/views/SettingView.vue";
import CompanyForm from "@/features/settings/views/CompanyForm.vue";
import DepartmentForm from "@/features/settings/views/DepartmentForm.vue";
import PositionForm from "@/features/settings/views/PositionForm.vue";
import RoleForm from "@/features/settings/views/RoleForm.vue";
import HoolidayForm from "@/features/settings/views/HoolidayForm.vue";

export const settingsRoutes = [
    {
        path: '/setting',
        name: 'SettingView',
        component: SettingView,
        redirect: '/setting/company',
        meta: { requiresMaster: true },
        children:[
            {
            path:'company',
            component: CompanyForm
            },
            {
                path:'department',
                component: DepartmentForm
            },{
                path:'position',
                component:PositionForm
            },{
                path:'role',
                component:RoleForm
            },{
                path:'holiday',
                component:HoolidayForm
            }
        ]
    },
];
