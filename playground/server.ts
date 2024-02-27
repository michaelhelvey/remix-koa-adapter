import Koa from 'koa'
import serve from 'koa-static'
import path from 'path'
import { broadcastDevReady } from '@remix-run/server-runtime'
import { createRequestHandler } from 'remix-koa-adapter'

const app = new Koa()

const BUILD_DIR = path.join(process.cwd(), 'build')
const build = require(BUILD_DIR)

app.use(serve('public'))

app.use(
	createRequestHandler({
		build,
	})
)

const port = process.env.PORT ?? 3000
app.listen(port, () => {
	console.log(`✅ App listening on port ${port}`)

	if (process.env.NODE_ENV === 'development') {
		broadcastDevReady(build)
	}
})
