import path from 'node:path'

import { log } from '@dialect-inc/logger'
import { packageDirs } from '@dialect-inc/paths'
import invariant from 'tiny-invariant'
import type { ViteDevServer } from 'vite'
import { build, createServer } from 'vite'

// eslint-disable-next-line prefer-const -- We need to use let to reassign after the Promise
let playgroundDevServer: ViteDevServer | undefined
const emailsBuilderWatcher = await build({
	configFile: path.join(packageDirs.emails, 'vite.config.ts'),
	build: {
		watch: {}
	}
})
invariant('on' in emailsBuilderWatcher, 'build should return a rollup watcher')

emailsBuilderWatcher.on('event', (event) => {
	if (event.code === 'END' && playgroundDevServer !== undefined) {
		playgroundDevServer.ws.send({
			type: 'custom',
			event: 'emails-compiled'
		})
	}
})

await new Promise<void>((resolve) => {
	emailsBuilderWatcher.on('event', (event) => {
		if (event.code === 'END') {
			resolve()
		}
	})
})

log.info('Starting Playground dev server...')
const playgroundDir = path.join(packageDirs.emails, 'playground')
playgroundDevServer = await createServer({
	configFile: path.join(playgroundDir, 'vite.config.ts')
})
await playgroundDevServer.listen()
