import { Form, useLoaderData } from '@remix-run/react'
import { LoaderFunctionArgs, redirect } from '@remix-run/server-runtime'

export const loader = ({ request }: LoaderFunctionArgs) => {
	const cookies = request.headers.get('Cookie')

	return {
		cookies,
	}
}

export async function action() {
	const headers = new Headers()
	headers.append('Set-Cookie', 'foo=bar;')
	headers.append('Set-Cookie', 'bar=baz;')

	return redirect('/', {
		headers,
	})
}

export default function IndexRoute() {
	const { cookies } = useLoaderData<typeof loader>()

	return (
		<>
			<div>
				Cookies: <pre>{cookies}</pre>
			</div>
			<Form method="post">
				<button type="submit">Set the cookies</button>
			</Form>
		</>
	)
}
