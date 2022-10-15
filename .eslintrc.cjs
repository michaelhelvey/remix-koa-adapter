const typescriptEslintPlugin = require('@typescript-eslint/eslint-plugin')

// Disable typescript linting rules for certain kinds of files
const permissiveTypescriptRules = Object.keys(
	typescriptEslintPlugin.rules
).reduce((table, rule) => {
	table[`@typescript-eslint/${rule}`] = ['off']
	return table
}, {})

/** @type {import('@types/eslint').Linter.BaseConfig}*/
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.json'],
	},
	plugins: ['@typescript-eslint', 'jest'],
	extends: [
		'eslint:recommended',
		'prettier',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
	],
	rules: {
		'no-console': ['warn'],
	},
	// While we use vitest instead of jest, because of the very similar API, we
	// can still make good use of jest's linting plugin
	settings: {
		jest: {
			version: 28,
		},
	},
	overrides: [
		{
			files: ['*.test.*'],
			rules: {
				...permissiveTypescriptRules,
			},
		},
	],
}
