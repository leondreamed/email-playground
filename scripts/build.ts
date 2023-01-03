import { cli } from '@dialect-inc/cli-helpers'

await cli.pnpm(['exec', 'vite', 'build', '--watch'], {
	env: {
		NODE_OPTIONS: '--loader @dialect-inc/ts-node/esm'
	}
})
