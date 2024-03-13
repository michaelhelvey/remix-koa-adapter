import type { EntryContext } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'

import { PassThrough } from 'node:stream'

import { createReadableStreamFromReadable } from '@remix-run/node'
import { renderToPipeableStream } from 'react-dom/server'

const ABORT_DELAY = 5_000

export default function handleBrowserRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext
) {
	return new Promise((resolve, reject) => {
		const { abort, pipe } = renderToPipeableStream(
			<RemixServer
				context={remixContext}
				url={request.url}
				abortDelay={ABORT_DELAY}
			/>,
			{
				onShellReady() {
					const body = new PassThrough()

					responseHeaders.set('Content-Type', 'text/html')

					resolve(
						new Response(createReadableStreamFromReadable(body), {
							headers: responseHeaders,
							status: responseStatusCode,
						})
					)

					pipe(body)
				},
				onShellError(error: unknown) {
					reject(error)
				},
				onError(error: unknown) {
					console.error(error)
					responseStatusCode = 500
				},
			}
		)

		setTimeout(abort, ABORT_DELAY)
	})
}
