import React from 'react';
import { Layout } from 'antd';
import { graphql } from 'gatsby';
import Header from '../../components/PageLayout/Header';
import SidebarWrapper from '../../components/PageLayout/Sidebar';
import SEO from '../../components/Seo';
import Comment from '../../components/Comment';
// import Config from '../../../config';
// import Utils from '../../utils/pageUtils';

import 'prismjs/themes/prism-solarizedlight.css';
import './highlight-syntax.less';
import style from './post.module.less';

const Post = ({ data }) => {
  const { html, frontmatter } = data.markdownRemark;
  const { title, excerpt, path } = frontmatter;
  // const canonicalUrl = Utils.resolvePageUrl(Config.siteUrl, Config.pathPrefix, path);
  return (
    <Layout className="outerPadding">
      <Layout className="container">
        <SEO
          title={title}
          description={excerpt || title}
          path={path}
          keywords={['Tiffany', '霖LiN', 'Fronted developer', 'Javascript', 'ReactJS']}
        />
        <Header />
        <SidebarWrapper>
          <div className="marginTopTitle">
            <h1>{title}</h1>
            <article className={style.blogArticle} dangerouslySetInnerHTML={{ __html: html }} />
            <Comment pageId={path} title={title} />
          </div>
        </SidebarWrapper>
      </Layout>
    </Layout>
  );
};

export const pageQuery = graphql`
  query($postPath: String!) {
    markdownRemark(frontmatter: { path: { eq: $postPath } }) {
      html
      timeToRead
      frontmatter {
        title
        date(formatString: "DD MMM YYYY")
        tags
        path
        excerpt
      }
    }
    allMarkdownRemark(
      filter: { frontmatter: { path: { ne: $postPath } }, fileAbsolutePath: { regex: "/index.md$/" } }
    ) {
      edges {
        node {
          frontmatter {
            path
            title
            tags
            excerpt
          }
        }
      }
    }
  }
`;

export default Post;
