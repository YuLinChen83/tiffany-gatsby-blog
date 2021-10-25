import React from 'react';
import { Row, Col } from 'antd';
import ProgressBar from '../../Progress';
import style from './homepage.module.less';

const SkillsProgress = () => (
  <div>
    <h2>My Skills</h2>
    <Row gutter={[20, 20]}>
      <Col xs={24} sm={24} md={12}>
        <p>目前較常使用的：(2021年為準)</p>
        <ProgressBar percent={80} text="Javascript" />
        <ProgressBar percent={80} text="ReactJS (Class component / Hooks)" />
        <ProgressBar percent={80} text="Redux" />
        <ProgressBar percent={70} text="Redux-Observable" />
        <ProgressBar percent={70} text="Redux-Saga" />
        <ProgressBar percent={80} text="Redux-Thunk" />
        <ProgressBar percent={80} text="Ant Design" />
        <ProgressBar percent={80} text="CSS, SCSS" />
        <ProgressBar percent={60} text="Vue.js" />
        <ProgressBar percent={60} text="Jest" />
        <ProgressBar percent={90} text="Git (GUI: GitKraken, SourceTree)" />
        <ProgressBar percent={80} text="ESLint" />
        <ProgressBar percent={70} text="NodeJS" />
        <ProgressBar percent={50} text="Webpack" />
      </Col>
      <Col xs={24} sm={24} md={12}>
        <div className={style.more}>
          <p>
            <span>其他</span>曾經工作或在學時接觸過或自己略研究過：
          </p>
          <h3>Frontend</h3>
          <ul>
            <li>TypeScript</li>
            <li>Apollo Client</li>
            <li>Ruby on Rails</li>
            <li>Bootstrap, Material Design, LESS</li>
            <li>Angular 1 / 2</li>
          </ul>
          <h3>Backend</h3>
          <ul>
            <li>Express</li>
            <li>Prisma</li>
            <li>Firebase</li>
            <li>MongoDB, Mongoose</li>
            <li>Apollo GraphQL / GraphQL Yoga</li>
            <li>MSSQL T-SQL / MySQL</li>
            <li>PHP</li>
            <li>Python</li>
          </ul>
          <h3>Others</h3>
          <ul>
            <li>Docker</li>
            <li>RxJS</li>
            <li>ASP.NET C# Webform / MVC, Visual Basic</li>
            <li>TestCafe</li>
            <li>Storybook</li>
            <li>Markdown</li>
            <li>GatsbyJS, Hexo, Wordpress</li>
            <li>Java / Java Play Framework</li>
            <li>SVN, TFS</li>
            <li>Assembly Language</li>
          </ul>
        </div>
      </Col>
    </Row>
  </div>
);

export default SkillsProgress;
