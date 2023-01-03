import './style.css'

import { html } from 'common-tags'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			component: async () => import('./pages/emails-list.vue')
		},
		{
			path: '/:slug',
			component: async () => import('./pages/[slug].vue')
		}
	]
})

const app = createApp({
	template: html`<RouterView />`
})
app.use(router)

app.mount('#app')
