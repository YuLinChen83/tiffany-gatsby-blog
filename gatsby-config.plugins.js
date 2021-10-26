const config = require('./config');
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});

module.exports = [
  'gatsby-plugin-react-helmet',
  'gatsby-transformer-sharp',
  'gatsby-plugin-sharp',
  'gatsby-plugin-less',
  'gatsby-plugin-offline',
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'images',
      path: `${__dirname}/src/images`,
    },
  },
  {
    resolve: 'gatsby-plugin-manifest',
    options: {
      name: 'Tiffany Chen',
      short_name: 'Tiffany',
      start_url: '/',
      background_color: '#81D8D0',
      theme_color: '#81D8D0',
      display: 'standalone',
      icon: 'src/images/favicon.png', // This path is relative to the root of the site.
      legacy: true, // this will add apple-touch-icon links to <head>. Required for
      // versions prior to iOS 11.3.
    },
  },
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'markdown-pages',
      path: `${__dirname}/content`,
    },
  },
  {
    resolve: 'gatsby-transformer-remark',
    options: {
      plugins: [
        {
          resolve: 'gatsby-remark-highlight-code',
          options: {
            terminal: 'carbon',
            theme: 'monokai',
            lineNumbers: true,
          },
        },
        {
          resolve: 'gatsby-remark-copy-linked-files',
          options: {
            destinationDir: 'path/to/dir',
            ignoreFileExtensions: ['png', 'jpg', 'jpeg', 'bmp', 'tiff'],
          },
        },
        'gatsby-remark-responsive-iframe',
        {
          resolve: 'gatsby-remark-images',
          options: {
            maxWidth: 1000,
            quality: 80,
            showCaptions: true,
            linkImagesToOriginal: false,
          },
        },
        {
          resolve: 'gatsby-remark-external-links',
          options: {
            rel: 'nofollow',
          },
        },
      ],
    },
  },
  // {
  //   resolve: 'gatsby-source-instagram-all',
  //   options: {
  //     access_token: process.env.INSTAGRAM_TOKEN,
  //   },
  // },
  // {
  //   resolve: 'gatsby-transformer-remark',
  //   options: {
  //     plugins: [
  //       {
  //         resolve: 'gatsby-remark-highlight-code',
  //       },
  //       {
  //         resolve: 'gatsby-remark-images',
  //         options: {
  //           maxWidth: 1000,
  //           quality: 80,
  //           showCaptions: true,
  //           linkImagesToOriginal: false,
  //         },
  //       },
  //       {
  //         resolve: 'gatsby-remark-external-links',
  //         options: {
  //           rel: 'nofollow',
  //         },
  //       },
  //       'gatsby-remark-prismjs',
  //     ],
  //   },
  // },
  {
    resolve: 'gatsby-plugin-i18n',
    options: {
      langKeyDefault: config.defaultLanguage,
      useLangKeyLayout: false,
    },
  },
  'gatsby-plugin-sitemap',
  'gatsby-plugin-robots-txt',
  {
    resolve: 'gatsby-plugin-antd',
    options: {
      javascriptEnabled: true,
    },
  },
  {
    resolve: 'gatsby-plugin-eslint-v2',
    options: {
      test: /\.js$|\.jsx$/,
      exclude: /(node_modules|.cache|public)/,
      stages: ['develop'],
      options: {
        emitWarning: true,
        failOnError: false,
      },
    },
  },
  // {
  //   resolve: 'gatsby-plugin-google-analytics',
  //   options: {
  //     // The property ID; the tracking code won't be generated without it
  //     trackingId: config.googleAnalyticTrackingId,
  //     // Defines where to place the tracking script - `true` in the head and `false` in the body
  //     head: false,
  //   },
  // },
  {
    resolve: 'gatsby-plugin-nprogress',
    options: {
      // Setting a color is optional.
      color: 'black',
      // Disable the loading spinner.
      showSpinner: true,
    },
  },
  {
    resolve: 'gatsby-plugin-disqus',
    options: {
      shortname: 'tiffany-blog',
    },
  },
];
