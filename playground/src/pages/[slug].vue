<script setup lang="ts">
import * as specs from '../../../src/specs/index.js'
import { EmailSpec } from '../../../src/utils/spec.js'
import { useRoute } from 'vue-router'
import { initializeEsbuild } from '../utils/esbuild.js'
import { ref, watch } from 'vue'
import { VueSpinner } from 'vue3-spinners'

const route = useRoute()
const slug = route.params.slug?.toString()
if (slug === undefined) {
	throw new Error('slug is undefined')
}

const spec: EmailSpec<any> = (specs as any)[slug]

const renderedEmail = ref()
const emailData = ref<Record<string, unknown> | undefined>()

let isSpecLoaded = false

async function renderEmail() {
	await initializeEsbuild()

	if (spec === undefined) {
		return
	}

	if (spec.dataSchema === null) {
		emailData.value = undefined
	} else {
		const dataProperties = Object.keys(spec.dataSchema._def.shape())
		emailData.value = Object.fromEntries(
			dataProperties.map((propertyKey) => [propertyKey, ''])
		)
	}

	await spec.load()
	isSpecLoaded = true
	renderedEmail.value = await spec.render(emailData.value)
}

watch(
	() => emailData.value,
	async () => {
		if (!isSpecLoaded) return
		renderedEmail.value = await spec.render(emailData.value)
	},
	{ deep: true }
)

renderEmail()

if (import.meta.hot) {
	import.meta.hot.on('emails-compiled', () => renderEmail())
}
</script>

<template>
	<template v-if="spec === undefined">
		<div class="text-lg font-black">404</div>
		<div>Spec not found.</div>
	</template>
	<template v-else-if="renderedEmail === undefined">
		<div class="mt-8 mx-auto flex flex-col items-center gap-2">
			<div>Loading...</div>
			<VueSpinner :size="70" />
		</div>
	</template>
	<template v-else>
		<div v-html="renderedEmail.html"></div>
		<div class="w-full flex flex-col items-center">
			<div class="h-[1px] bg-gray-300 self-stretch my-8 mx-8"></div>
			<h1 class="font-bold text-center text-2xl mb-2">Email Data</h1>
			<div
				v-for="[propertyKey, propertyValue] of Object.entries(emailData ?? {})"
			>
				<div class="flex gap-5 items-center">
					<label :for="propertyKey"
						><code>{{ propertyKey }}</code></label
					>
					<input
						class="border rounded-lg p-2"
						:id="propertyKey"
						:value="propertyValue"
						@input="(event) => emailData![propertyKey] = (event.target as any).value"
					/>
				</div>
			</div>
		</div>
	</template>
</template>
