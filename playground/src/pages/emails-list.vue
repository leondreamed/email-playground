<script setup lang="ts">
import * as specs from '../../../src/specs/index.js'
</script>

<template>
	<div class="flex flex-col">
		<template v-for="[slug, spec] of Object.entries(specs)" :key="slug">
			<RouterLink
				:to="slug"
				class="flex flex-row gap-2 px-4 py-2 items-center bg-[rgb(242,246,252)] group hover:shadow-md hover:z-10 cursor-pointer"
			>
				<i-material-symbols-check-box-outline-blank
					class="text-[rgb(187,190,194)] group-hover:text-[rgb(66,69,68)]"
				/>
				<i-material-symbols-star-outline-rounded
					class="text-[rgb(187,190,194)] group-hover:text-[rgb(66,69,68)]"
				/>
				<div class="text-[rgb(32,33,36)]">{{ spec.subject }}</div>
			</RouterLink>
			<div class="bg-[rgb(225,231,238)] h-[1px]"></div>
		</template>
	</div>
</template>
