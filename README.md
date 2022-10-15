# remix-koa-adapter

![build](https://github.com/michaelhelvey/remix-koa-adapter/actions/workflows/nodejs.yml/badge.svg)

This is a server adapter for using [koa](https://koajs.com) with the
[Remix](https:/remix.run) framework. It is more or less a straight-forward port
of [@remix-run/express](https://github.com/remix-run/remix/tree/main/packages/remix-express).

## Installation & Usage

-   `pnpm add remix-adapter-koa`

The package exports a Remix server adapter with a `createRequestHandler`
function. For more information on using Remix server adapters, please refer to the [Remix documentation](https://remix.run/docs/en/v1/other-api/adapter).

## Contributing & Local Development

-   `pnpm dev` Run minimal remix example against the adapter.
-   `pnpm test` (or `pnpm test:coverage`) for running unit tests
-   `pnpm build` to build the library for publishing

In the `playground` directory, there is a minimal Remix application that can be
run against the adapter to manually validate the its behavior. More thorough
specs for the adapter can be found in the unit tests, which are ported from the
unit tests for `@remix-run/express`, which I've considered the canonical adapter
implementation for the purpose of this project.

## Authors

-   [Michael Helvey](https://michaelhelvey.dev)

## License

[MIT](./LICENSE.md)
