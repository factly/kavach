// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Kavach',
  tagline: 'Open Source Identity Platform',
  url: 'https://kavach.factly.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'factly', // Usually your GitHub org/user name.
  projectName: 'kavach', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/factly/kavach',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        logo: {
          alt: 'Kavach-logo',
          src: 'img/kavach-logo.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'right',
            label: 'Docs',
          },
          {
            href: 'https://github.com/factly/kavach',
            label: 'GitHub',
            position: 'right',
          },
          {
            href: 'http://slack.factly.org',
            label: 'Slack',
            position: 'right',
          },
        ],
      },
      footer: {
        links: [
          {
            title: 'About',
            items: [
              {
                label: 'Factly Media & Research',
                to: 'https://factly.in',
                target: '_blank',
              },
              {
                label: 'About Us',
                to: 'https://factly.in/about',
                target: '_blank',
              },
              {
                label: 'Contact',
                href: 'mailto:admin@factly.in',
              },
              {
                label: 'Privacy Policy',
                to: 'docs/privacy-policy',
              },
            ],
          },
          {
            title: 'Social',
            items: [
              {
                label: 'Github',
                to: 'https://github.com/factly',
                target: '_blank',
              },
              {
                label: 'Facebook',
                to: 'https://facebook.com/factlyindia',
                target: '_blank',
              },
              {
                label: 'Twitter',
                to: 'https://twitter.com/factlyindia',
                target: '_blank',
              },
              {
                label: 'Instagram',
                to: 'https://www.instagram.com/factlyindia',
                target: '_blank',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Slack',
                to: 'https://slack.factly.org/',
                target: '_blank',
              },
              {
                label: 'Kavach',
                href: 'https://github.com/factly/kavach',
                target: '_blank',
              }
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'Guides',
                to: 'docs/what-is-dega',
              },
              {
                label: 'FAQ',
                to: 'docs/faq',
              },
            ],
          },
        ],
        logo: {
          alt: 'Kavach',
          src: 'img/kavach-logo.png',
        },
        copyright: `Copyright © ${new Date().getFullYear()} Factly Media & Research.`,
      },
      prism: {
        theme: require('prism-react-renderer/themes/dracula'),
        darkTheme: darkCodeTheme,
      },
    }),
    customFields: {
      hero: 'It is an identity platform built on Ory stack which natively manages security for multiple applications within the organisation. Written in Go and React.',
    },
};

module.exports = config;
