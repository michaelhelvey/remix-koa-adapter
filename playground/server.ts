import { ServerBuild } from '@remix-run/server-runtime'
import Koa from 'koa'
import serve from 'koa-static'
import path from 'path'
import { createRequestHandler } from 'remix-koa-adapter'

const app = new Koa()

const BUILD_DIR = path.join(process.cwd(), 'build')

app.use(serve('public'))

app.use(
	createRequestHandler({
		build: require(BUILD_DIR) as ServerBuild,
	})
)

const port = process.env.PORT ?? 3000
app.listen(port, () => {
	console.log(`✅ App listening on port ${port}`)
})
