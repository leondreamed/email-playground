import { defineConfig, Plugin, ViteDevServer } from 'vite'
import { servicesData } from '@dialect-inc/services-data'
import { join, dirname } from 'desm'
import vue from '@vitejs/plugin-vue'
import workspaceImports from 'rollup-plugin-workspace-imports'
import icons from 'unplugin-icons/vite'
import iconsResolver from 'unplugin-icons/resolver'
import components from 'unplugin-vue-components/vite'
import path from 'node:path'
import { packageDirs } from '@dialect-inc/paths'
import isPathInside from 'is-path-inside'
import invariant from 'tiny-invariant'

function preventSpecsFullPageReload(): Plugin {
	let server: ViteDevServer | undefined;
	const patchSendForOneCall = () => {
		invariant(server !== undefined, 'server is not undefined')
		const originalSend = server.ws.send.bind(server.ws)
		server.ws.send = () => {
			invariant(server !== undefined, 'server is not undefined')
			server.ws.send = originalSend
		}
	}
	return {
		name: 'prevent-specs-full-page-reload',
		configureServer(devServer) {
			server = devServer
		},
		handleHotUpdate(ctx) {
			/**
				Vite will always trigger a full reload whenever an .html file changes, but in our case, we want to manually handle that (since the HTML file isn't actually used to render a page but instead dynamically rendered on a page). Thus, we patch the next call to `ws.send` to prevent sending a full-reload.

				@see https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/hmr.ts#L106
			 */
			if (ctx.file.endsWith('.html')) {
				patchSendForOneCall()
				return []
			}

			/**
				We don't want to trigger a full page reload when a specs file is modified.
			*/
			if (isPathInside(ctx.file, path.join(packageDirs.emails, 'src/specs'))) {
				return []
			}
		}
	}
}

export default defineConfig({
	root: dirname(import.meta.url),
	plugins: [
		preventSpecsFullPageReload(),
		vue(),
		components({
			resolvers: [
				iconsResolver()
			]
		}),
		icons({
			autoInstall: true
		}),
		workspaceImports(),
	],
	resolve: {
		alias: {
			'vue': 'vue/dist/vue.esm-bundler.js'
		}
	},
	optimizeDeps: {
		entries: [join(import.meta.url, '../src/specs/*.ts')],
	},
	server: {
		port: servicesData.emails.port,
	},
	clearScreen: false
})