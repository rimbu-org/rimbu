import type { Config } from '@docusaurus/types';

import { themes } from 'prism-react-renderer';

export default {
	title: 'Rimbu',
	tagline: 'Immutable collections and tools for TypeScript',
	url: 'https://rimbu.org',
	baseUrl: '/',
	onBrokenLinks: 'warn',
	favicon: 'img/favicon.ico',
	organizationName: 'rimbu-org',
	projectName: 'rimbu',
	trailingSlash: false,
	themeConfig: {
		colorMode: {},
		navbar: {
			title: '',
			logo: {
				alt: 'Rimbu Logo',
				src: 'img/rimbu_logo.svg',
			},
			items: [
				{
					type: 'doc',
					docId: 'main',
					position: 'left',
					label: 'Docs',
				},
				{
					to: '/api',
					label: 'API Docs',
					position: 'left',
				},
				{ to: '/blog', label: 'Blog', position: 'left' },
				{
					href: 'https://github.com/rimbu-org/rimbu',
					label: 'GitHub',
					position: 'right',
				},
			],
		},
		footer: {
			style: 'dark',
			links: [
				{
					title: 'Docs',
					items: [
						{
							label: 'Docs',
							to: '/docs',
						},
					],
				},
				{
					title: 'Community',
					items: [
						{
							label: 'Github Discussions',
							href: 'https://github.com/rimbu-org/rimbu/discussions',
						},
						{
							label: 'Stack Overflow',
							href: 'https://stackoverflow.com/questions/tagged/rimbu',
						},
					],
				},
				{
					title: 'More',
					items: [
						{
							label: 'Blog',
							to: '/blog',
						},
						{
							label: 'GitHub',
							href: 'https://github.com/rimbu-org/rimbu',
						},
					],
				},
			],
			copyright: `Copyright © ${new Date().getFullYear()} Rimbu Org. Built with Docusaurus.`,
		},
		prism: {
			theme: themes.github,
			darkTheme: themes.dracula,
		},
		algolia: {
			appId: 'IAVOF6BFDF',
			apiKey: '72449e7a59c300d31b1f18ad2473d99a',
			indexName: 'rimbu',
			contextualSearch: true,
			// Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
			// externalUrlRegex: 'external\\.com|domain\\.com',
			// Optional: Algolia search parameters
			// searchParameters: {},
			// Optional: path for search page that enabled by default (`false` to disable it)
			searchPagePath: 'search',
		},
	},
	presets: [
		[
			'@docusaurus/preset-classic',
			{
				docs: {
					sidebarPath: require.resolve('./sidebars.js'),
				},
				blog: {
					showReadingTime: true,
					onInlineAuthors: 'ignore',
				},
				theme: {
					customCss: require.resolve('./src/css/custom.css'),
				},
				gtag: {
					trackingID: 'G-MG8SZG61N5',
					anonymizeIP: true,
				},
				googleAnalytics: {
					trackingID: 'G-MG8SZG61N5',
					anonymizeIP: true,
				},
			},
		],
	],
	plugins: [
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'api',
				path: 'api',
				routeBasePath: 'api',
			},
		],
	],
} satisfies Config;
