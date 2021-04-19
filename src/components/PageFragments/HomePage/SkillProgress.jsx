import React from 'react';
import { Row, Col } from 'antd';
import ProgressBar from '../../Progress';
import style from './homepage.module.less';

const SkillsProgress = () => (
  <div>
    <h2>My Skills</h2>
    <Row gutter={[20, 20]}>
      <Col xs={24} sm={24} md={12}>
        <p>目前工作主要使用：</p>
        <ProgressBar percent={80} text="Javascript" />
        <ProgressBar percent={80} text="ReactJS (Class component / Hooks)" />
        <ProgressBar percent={90} text="Redux" />
        <ProgressBar percent={70} text="Redux-Observable" />
        <ProgressBar percent={90} text="Ant Design" />
        <ProgressBar percent={80} text="CSS, SCSS" />
        <ProgressBar percent={60} text="RxJS" />
        <ProgressBar percent={60} text="Vue.js" />
        <ProgressBar percent={75} text="Jest" />
        <ProgressBar percent={90} text="Git (GUI: GitKraken, SourceTree)" />
        <ProgressBar percent={80} text="ESLint" />
        <ProgressBar percent={80} text="NodeJS" />
        <ProgressBar percent={60} text="Webpack" />
        <ProgressBar percent={40} text="Docker" />
      </Col>
      <Col xs={24} sm={24} md={12}>
        <div className={style.more}>
          <p>其他曾經工作或在學時接觸過／自己略研究過：</p>
          <h3>Frontend</h3>
          <ul>
            <li>TypeScript</li>
            <li>Apollo Client</li>
            <li>Java Play Framework</li>
            <li>Ruby on Rails</li>
            <li>Bootstrap, Material Design, LESS</li>
            <li>Angular1/2</li>
          </ul>
          <h3>Backend</h3>
          <ul>
            <li>Express</li>
            <li>Prisma</li>
            <li>Firebase</li>
            <li>MongoDB, Mongoose</li>
            <li>Apollo GraphQL</li>
            <li>GraphQL Yoga</li>
            <li>MSSQL T-SQL</li>
            <li>MySQL</li>
            <li>PHP</li>
            <li>Python</li>
          </ul>
          <h3>Others</h3>
          <ul>
            <li>ASP.NET C# Webform / MVC, Visual Basic</li>
            <li>TestCafe</li>
            <li>Storybook</li>
            <li>Markdown</li>
            <li>GatsbyJS, Hexo, Wordpress</li>
            <li>SVN, TFS</li>
            <li>Java</li>
            <li>Assembly Language</li>
          </ul>
        </div>
      </Col>
    </Row>
  </div>
);

export default SkillsProgress;
