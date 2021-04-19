module.exports = {
  pathPrefix: '/tiffany-gatsby-blog',
  siteUrl: 'http://localhost:8000',
  siteTitle: '霖LiN的隨意空間 – 記錄生活與學習分享',
  siteDescription: '預計是想分享些學習筆記、旅遊、烘焙、動漫心得等等的東西。',
  author: 'Tiffany (霖LiN)',
  postsForArchivePage: 3,
  defaultLanguage: 'en',
  pages: {
    home: '/',
    blog: 'blog',
    algorithm: 'algorithm',
    contact: 'contact',
    resume: 'resume',
    tag: 'tags',
  },
  social: {
    github: 'https://github.com/YuLinChen83',
    facebook: 'https://www.facebook.com/tiffany199411/',
    instagram: 'https://www.instagram.com/yu1inchen/',
    rss: '/rss.xml',
  },
  contactFormUrl: process.env.CONTACT_FORM_ENDPOINT || 'https://getform.io/f/09a3066f-c638-40db-ad59-05e4ed71e451',
  googleAnalyticTrackingId: process.env.GA_TRACKING_ID || '',
  tags: {
    javascript: {
      name: 'javascript',
      description:
        'JavaScript is an object-oriented programming language used alongside HTML and CSS to give functionality to web pages.',
      color: '#f0da50',
    },
    nodejs: {
      name: 'Node.js',
      description: 'Node.js is a tool for executing JavaScript in a variety of environments.',
      color: '#90c53f',
    },
    rxjs: {
      name: 'RxJS',
      description: 'RxJS is a library for reactive programming using Observables, for asynchronous operations.',
      color: '#eb428e',
    },
    typescript: {
      name: 'typescript',
      description: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.',
      color: '#257acc',
    },
    reactjs: {
      name: 'reactjs',
      description: 'React is an open source JavaScript library used for designing user interfaces.',
      color: '#61dbfa',
    },
    gatsby: {
      name: 'Gatsby.js',
      description: 'A framework built over ReactJS to generate static page web application.  ',
      color: '#6f309f',
    },
    html: {
      name: 'HTML',
      description: 'A markup language that powers the web. All websites use HTML for structuring the content.',
      color: '#dd3431',
    },
    css: {
      name: 'css',
      description: 'CSS is used to style the HTML element and to give a very fancy look for the web application.',
      color: '#43ace0',
    },
    'asp.net': {
      name: 'ASP.NET',
      description: 'A framework for building web apps and services with .NET and C#.',
      color: '#7014e8',
    },
    security: {
      name: 'Information security',
      description: 'Concept about information security',
      color: '#000',
    },
    prisma: {
      name: 'Prisma',
      description: "A declarative way to define your app's data models and their relations that's human-readable.",
      color: '#0c344b',
    },
    apollo: {
      name: 'Apollo',
      description:
        "Apollo Server is an open-source, spec-compliant GraphQL server that's compatible with any GraphQL client, including Apollo Client. It's the best way to build a production-ready, self-documenting GraphQL API that can use data from any source.",
      color: '#3f20ba',
    },
    firebase: {
      name: 'Firebase',
      description:
        'Backed by Google and loved by app development teams - from startups to global enterprises',
      color: '#1a73e8',
    },
    mongodb: {
      name: 'MongoDB',
      description:
        'Accelerate your innovation with a flexible data platform designed to help you build, scale, and iterate.',
      color: '#13aa52',
    },
  },
};
