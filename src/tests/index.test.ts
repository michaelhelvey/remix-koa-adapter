import { withApp } from '@michaelhelvey/microtest'
import {
	createRequestHandler as createRemixRequestHandler,
	createReadableStreamFromReadable,
	json,
} from '@remix-run/node'
import Koa from 'koa'
import { Readable } from 'stream'
import { createRemixHeaders, createRequestHandler } from '../index'

vi.mock('@remix-run/node', async () => {
	const actual = await import('@remix-run/node')

	return {
		...actual,
		createRequestHandler: vi.fn(),
	}
})

function createApp() {
	const app = new Koa()

	app.use(
		createRequestHandler({
			// Because we're mocking out createRequestHandler from @remix-run/node,
			// we don't have to worry about having a real remix app here.
			build: undefined as any,
		})
	)

	return app
}

const mockHandler = vi.mocked(createRemixRequestHandler)

describe('createRequestHandler', () => {
	it('handles requests', async () => {
		mockHandler.mockImplementation(() => async (req: Request) => {
			return new Response(`URL: ${new URL(req.url).pathname}`, {
				headers: { 'x-custom-header': 'foo' },
			})
		})

		const request = withApp(createApp())()
		const response = await request((ctx) => ctx.get('/foo/bar')).raw()

		expect(response.status).toEqual(200)

		const text = await response.text()
		expect(text).toEqual('URL: /foo/bar')
		expect(response.headers.get('x-custom-header')).toEqual('foo')
	})

	it('handles null body', async () => {
		mockHandler.mockImplementation(() => async () => {
			return new Response(null, { status: 200 })
		})

		const request = withApp(createApp())()
		const res = await request((ctx) => ctx.get('/')).raw()

		expect(res.status).toBe(200)
	})

	// https://github.com/node-fetch/node-fetch/blob/4ae35388b078bddda238277142bf091898ce6fda/test/response.js#L142-L148
	it('handles body as stream', async () => {
		mockHandler.mockImplementation(() => async () => {
			const stream = Readable.from('hello world')
			return new Response(createReadableStreamFromReadable(stream), {
				status: 200,
			}) as unknown as Response
		})

		const request = withApp(createApp())()
		// note: vercel's createServerWithHelpers requires a x-now-bridge-request-id
		const res = await request((ctx) =>
			ctx.get('/').header('x-now-bridge-request-id', '2')
		).raw()

		expect(res.status).toBe(200)
		expect(await res.text()).toBe('hello world')
	})

	it('handles status codes', async () => {
		mockHandler.mockImplementation(() => async () => {
			return new Response(null, { status: 204 })
		})

		const request = withApp(createApp())()
		const res = await request((ctx) => ctx.get('/')).raw()

		expect(res.status).toBe(204)
	})

	it('handles post requests', async () => {
		mockHandler.mockImplementation(() => async () => {
			return json({ foo: 'bar' })
		})

		const request = withApp(createApp())()
		const res = await request((ctx) => ctx.post('/'))
			.status(200)
			.json()
		expect(res).toEqual({ foo: 'bar' })
	})

	it('sets headers', async () => {
		mockHandler.mockImplementation(() => async () => {
			const headers = new Headers({ 'X-Time-Of-Year': 'most wonderful' })
			headers.append(
				'Set-Cookie',
				'first=one; Expires=0; Path=/; HttpOnly; Secure; SameSite=Lax'
			)
			headers.append(
				'Set-Cookie',
				'second=two; MaxAge=1209600; Path=/; HttpOnly; Secure; SameSite=Lax'
			)
			headers.append(
				'Set-Cookie',
				'third=three; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Path=/; HttpOnly; Secure; SameSite=Lax'
			)
			return new Response(null, { headers })
		})

		const request = withApp(createApp())()
		const res = await request((ctx) => ctx.get('/')).raw()

		expect(res.headers.get('x-time-of-year')).toBe('most wonderful')
		// Note: we assert things this way simply because microtest returns a
		// fetch request with a Headers object.  This Headers object folds
		// headers together into comma-separated strings.  This is correct for
		// pretty much every header in the spec other than Set-Cookie.  However,
		// the browser doesn't care about the Fetch API's Header header folding
		// behavior, the cookies will get set just fine (see the playground).
		// So in our tests, we can just pretend that comma-separated values are
		// fine here, because it's just an artifact of the fetch API, not our
		// koa adapter.
		expect(res.headers.get('set-cookie')).toEqual(
			[
				'first=one; Expires=0; Path=/; HttpOnly; Secure; SameSite=Lax',
				'second=two; MaxAge=1209600; Path=/; HttpOnly; Secure; SameSite=Lax',
				'third=three; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Path=/; HttpOnly; Secure; SameSite=Lax',
			].join(', ')
		)
	})
})

describe('express createRemixHeaders', () => {
	describe('creates fetch headers from express headers', () => {
		it('handles empty headers', () => {
			const headers = createRemixHeaders({})
			expect(Object.fromEntries(headers.entries())).toMatchInlineSnapshot(
				`{}`
			)
		})

		it('handles simple headers', () => {
			const headers = createRemixHeaders({ 'x-foo': 'bar' })
			expect(headers.get('x-foo')).toBe('bar')
		})

		it('handles multiple headers', () => {
			const headers = createRemixHeaders({
				'x-foo': 'bar',
				'x-bar': 'baz',
			})
			expect(headers.get('x-foo')).toBe('bar')
			expect(headers.get('x-bar')).toBe('baz')
		})

		it('handles headers with multiple values', () => {
			const headers = createRemixHeaders({
				'x-foo': ['bar', 'baz'],
				'x-bar': 'baz',
			})
			expect(headers.get('x-foo')).toEqual('bar, baz')
			expect(headers.get('x-bar')).toBe('baz')
		})

		it('handles multiple set-cookie headers', () => {
			const headers = createRemixHeaders({
				'set-cookie': [
					'__session=some_value; Path=/; Secure; HttpOnly; MaxAge=7200; SameSite=Lax',
					'__other=some_other_value; Path=/; Secure; HttpOnly; Expires=Wed, 21 Oct 2015 07:28:00 GMT; SameSite=Lax',
				],
			})
			expect(headers.get('set-cookie')).toEqual(
				'__session=some_value; Path=/; Secure; HttpOnly; MaxAge=7200; SameSite=Lax, __other=some_other_value; Path=/; Secure; HttpOnly; Expires=Wed, 21 Oct 2015 07:28:00 GMT; SameSite=Lax'
			)
		})
	})
})
