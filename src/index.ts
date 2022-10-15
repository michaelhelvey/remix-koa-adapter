import type {
	AppLoadContext,
	RequestInit as NodeRequestInit,
	Response as NodeResponse,
	ServerBuild,
} from '@remix-run/node'
import {
	AbortController as NodeAbortController,
	createRequestHandler as createRemixRequestHandler,
	Headers as RemixHeaders,
	Request as RemixRequest,
	writeReadableStreamToWritable,
} from '@remix-run/node'
import type * as koa from 'koa'
import './globals'

/**
 * A function that returns the value to use as `context` in route `loader` and
 * `action` functions.
 *
 * You can think of this as an escape hatch that allows you to pass
 * environment/platform-specific values through to your loader/action, such as
 * values that are generated by koa middleware.
 */
export type GetLoadContextFunction = (ctx: koa.Context) => AppLoadContext

export type RequestHandler = (ctx: koa.Context) => Promise<void>

export type RequestHandlerBuilderArgs = {
	build: ServerBuild
	getLoadContext?: GetLoadContextFunction
	mode?: string
}

/**
 * Returns a request handler for koa that serves the response using Remix.
 *
 * @see https://remix.run/docs/en/v1/other-api/adapter
 */
export function createRequestHandler({
	build,
	getLoadContext,
	mode = process.env.NODE_ENV,
}: RequestHandlerBuilderArgs): RequestHandler {
	const handleRequest = createRemixRequestHandler(build, mode)

	return async (ctx) => {
		const request = createRemixRequest(ctx)
		const loadContext = getLoadContext?.(ctx)

		const response = (await handleRequest(
			request,
			loadContext
		)) as NodeResponse

		await sendRemixResponse(ctx, response)
	}
}

export function createRemixHeaders(
	requestHeaders: koa.Request['headers']
): RemixHeaders {
	const headers = new RemixHeaders()
	/*

	for (const [key, values] of Object.entries(requestHeaders)) {
		if (values) {
			if (Array.isArray(values)) {
				for (const value of values) {
					headers.append(key, value)
				}
			} else {
				headers.set(key, values)
			}
		}
	}
	*/

	return headers
}

export function createRemixRequest(ctx: koa.Context): RemixRequest {
	const origin = `${ctx.protocol}://${ctx.host}`
	const url = new URL(ctx.url, origin)

	// Abort action/loaders once we can no longer write a response
	const controller = new NodeAbortController()
	ctx.res.on('close', () => controller.abort())

	const init: NodeRequestInit = {
		method: ctx.method,
		headers: createRemixHeaders(ctx.headers),
		// Cast until reason/throwIfAborted added
		// https://github.com/mysticatea/abort-controller/issues/36
		signal: controller.signal as Exclude<
			NodeRequestInit['signal'],
			undefined
		>,
	}

	if (ctx.method !== 'GET' && ctx.method !== 'HEAD') {
		init.body = ctx.req
	}

	return new RemixRequest(url.href, init)
}

export async function sendRemixResponse(
	ctx: koa.Context, // write to
	nodeResponse: NodeResponse // read from
): Promise<void> {
	ctx.status = nodeResponse.status
	ctx.message = nodeResponse.statusText

	// TODO: insert headers
	/*
	for (const [key, values] of Object.entries(nodeResponse.headers.raw())) {
		for (const value of values) {
			res.append(key, value)
		}
	}
	*/

	if (nodeResponse.body) {
		await writeReadableStreamToWritable(nodeResponse.body, ctx.res)
	}
}
