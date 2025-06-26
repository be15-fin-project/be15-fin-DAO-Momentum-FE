import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        //나중에 다른 기능과 관련된 routes들을 추가하면 된다.
        {
            path: '/',
            // component: ,
            children: [

            ]
        },

    ]
})

