# remix-koa-adapter

![build](https://github.com/michaelhelvey/remix-koa-adapter/actions/workflows/nodejs.yml/badge.svg)
[![npm version](https://badge.fury.io/js/remix-koa-adapter.svg)](https://badge.fury.io/js/remix-koa-adapter)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

This is a server adapter for using [koa](https://koajs.com) with the
[Remix](https:/remix.run) framework. It is more or less a straight-forward port
of [@remix-run/express](https://github.com/remix-run/remix/tree/main/packages/remix-express).

## Installation & Usage

-   `npm install remix-koa-adapter` (or use pnpm, yarn, etc)

The package exports a Remix server adapter with a `createRequestHandler`
function. For more information on using Remix server adapters, please refer to the [Remix documentation](https://remix.run/docs/en/v1/other-api/adapter).

**Usage Example:**

```ts
import Koa from 'koa'
import serve from 'koa-static'
import path from 'path'
import { createRequestHandler } from 'remix-koa-adapter'

const app = new Koa()

const BUILD_DIR = path.join(process.cwd(), 'build')

app.use(serve('public'))

app.use(
	createRequestHandler({
		build: require(BUILD_DIR),
	})
)

const port = process.env.PORT ?? 3000
app.listen(port, () => {
	console.log(`✅ App listening on port ${port}`)
})
```

## Contributing & Local Development

-   `pnpm dev` Run minimal remix example against the adapter.
-   `pnpm test` (or `pnpm test:coverage`) for running unit tests
-   `pnpm build` to build the library for publishing

In the `playground` directory, there is a minimal Remix application that can be
run against the adapter to manually validate the its behavior. More thorough
specs for the adapter can be found in the unit tests, which are ported from the
unit tests for `@remix-run/express`, which I've considered the canonical adapter
implementation for the purpose of this project.

## License

[MIT](./LICENSE.md)
