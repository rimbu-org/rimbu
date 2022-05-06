const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Rimbu',
  tagline: 'Immutable collections and tools for TypeScript',
  url: 'https://rimbu.org',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
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
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/rimbu-org/rimbu/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/rimbu-org/rimbu/edit/master/website/blog/',
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
  webpack: {
    jsLoader: (isServer) => ({
      loader: require.resolve('esbuild-loader'),
      options: {
        loader: 'tsx',
        format: isServer ? 'cjs' : undefined,
        target: isServer ? 'node12' : 'es2017',
      },
    }),
  },
};
