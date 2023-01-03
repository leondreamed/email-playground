import fs from 'node:fs'
import path from 'node:path'

import { doIUseEmail } from 'doiuse-email'
import htmlMinifier from 'rollup-plugin-html-minifier'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import mapObject from 'map-obj'
import { join } from 'desm'
import { EmailSpec, importEmailSpecs } from "./src/utils/spec.js"
import workspaceImports from 'rollup-plugin-workspace-imports'
import { globbySync } from 'globby'

function encodeEjs(html: string) {
	return html.replace(
		/(<%[#=_-]?)(.*?)([_-]?%>)/g,
		(_match, open: string, content: string, close: string) =>
			`<ejs>${encodeURIComponent(
				JSON.stringify({ open, close, content })
			)}</ejs>`
	)
}

/**
	Temporarily turns EJS tags into <ejs open="<%" close="%>">inlineJs</ejs> so that HTML can parse properly
*/
function preserveEjs(): Plugin {
	function decodeEjs(html: string) {
		return html.replace(/<ejs>(.*?)<\/ejs>/g, (_match, encodedEjs: string) => {
			const { open, close, content } = JSON.parse(
				decodeURIComponent(encodedEjs)
			) as { open: string; close: string; content: string }

			return `${open}${content}${close}`
		})
	}

	return {
		name: 'preserve-ejs',
		load(id) {
			if (!id.endsWith('.html')) return
			const html = encodeEjs(fs.readFileSync(id, 'utf8'))
			return html
		},
		writeBundle(options, bundle) {
			for (const file of Object.values(bundle)) {
				if (
					'source' in file &&
					file.fileName.endsWith('.html') &&
					options.dir !== undefined
				) {
					fs.writeFileSync(
						path.join(options.dir, file.fileName),
						decodeEjs(file.source.toString())
					)
				}
			}
		}
	}
}

function doiuseEmailPlugin(): Plugin {
	return {
		name: 'doiuse-email',
		transformIndexHtml: {
			enforce: 'pre',
			transform(html) {
				const result = doIUseEmail(html, {
					emailClients: ['gmail.*', '!gmail.mobile-webmail']
				})

				if (!result.success) {
					throw new Error(JSON.stringify(result, null, 2))
				}

				return undefined
			}
		}
	}
}

function emailSpecs(): Plugin {
	return {
		name: 'email-specs',
		resolveId(id) {
			if (id.endsWith('.html')) {
				return id
			}

			return null;
		},
		async load(id) {
			const emailFileName = id.replace('email-spec:', '').replace('.html', '')
			const { default: emailSpec } = await import(`./src/specs/${emailFileName}.js?t=${Date.now()}`) as { default: EmailSpec<any> }
			return encodeEjs(emailSpec.uncompiledHtml)
		}
	};
}


const specs = await importEmailSpecs()

const input = {
	...mapObject(specs, (slug) => [
		slug,
		`${slug}.html`
	])
}

function watchSpecs(): Plugin {
	return {
		name: 'watch-specs',
		buildStart() {
			const specFiles = globbySync(join(import.meta.url, './src/specs/*.ts'))
			for (const specFile of specFiles) {
				this.addWatchFile(specFile)
			}
		}
	}
}

export default defineConfig({
	plugins: [
		emailSpecs(),
		workspaceImports(),
		doiuseEmailPlugin(),
		viteSingleFile(),
		preserveEjs(),
		watchSpecs()
	],
	build: {
		cssCodeSplit: false,
		minify: true,
		outDir: join(import.meta.url, 'dist-emails'),
		modulePreload: {
			polyfill: false
		},
		rollupOptions: {
			plugins: [
				htmlMinifier({
					options: { collapseWhitespace: true, minifyCSS: true },
					include: ['**/*.html']
				}) as any,
			],
			input,
		},
		emptyOutDir: false
	}
})