import esbuild from 'esbuild-wasm'
import esbuildUrl from 'esbuild-wasm/esbuild.wasm?url'
import onetime from 'onetime'

export const initializeEsbuild = onetime(async () => {
	await esbuild.initialize({
		wasmURL: esbuildUrl
	})
})
