// will not compile without typescript support for tests
type Example<T> = { a: T }

describe('module', () => {
	it('works', () => {
		const x: Example<string> = { a: 'hi' }
		expect(x.a).toEqual('hi')
	})
})
