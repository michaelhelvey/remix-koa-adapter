import { ServerBuild } from '@remix-run/server-runtime'
import Koa from 'koa'
import path from 'path'
import { createRequestHandler } from 'remix-koa-adapter'

const app = new Koa()

const BUILD_DIR = path.join(process.cwd(), 'build')
console.log('Resolved build dir to', BUILD_DIR)

app.use(
	createRequestHandler({
		build: require(BUILD_DIR) as ServerBuild,
	})
)

const port = process.env.PORT ?? 3000
app.listen(port, () => {
	console.log(`✅ App listening on port ${port}`)
})
