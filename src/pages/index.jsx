import React from 'react';
import { graphql } from 'gatsby';
import { Layout } from 'antd';
import Header from '../components/PageLayout/Header';
import SidebarWrapper from '../components/PageLayout/Sidebar';
import AboutMe from '../components/PageFragments/HomePage/AboutMe';
import Skills from '../components/PageFragments/HomePage/SkillProgress';
import Gallery from '../components/PageFragments/HomePage/Gallery';

export default ({ data }) => (
  <Layout className="outerPadding">
    <Layout className="container">
      <Header />
      <SidebarWrapper>
        <>
          <AboutMe />
          <Gallery list={data.allInstagramContent.edges} />
          <Skills />
        </>
      </SidebarWrapper>
    </Layout>
  </Layout>
);

export const query = graphql`
  {
    allInstagramContent(limit: 10) {
      edges {
        node {
          localImage {
            childImageSharp {
              fixed(width: 150, height: 150) {
                ...GatsbyImageSharpFixed
              }
            }
          }
          permalink
        }
      }
    }
  }
`;
