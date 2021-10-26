import React from 'react';
import SEO from '../../Seo';
import style from './homepage.module.less';

const pageText = `
Hello，我是 Tiffany，喜歡登山踏青看風景的動漫宅內向女子，也喜歡烘焙、羽球。
曾經喜歡美工設計所以擔任各種美宣（社團or系上），曾經熱愛跆拳練到黑帶，參加過跆拳道社、劍道社、吉他地社。
於 2016 年畢業於輔大資訊工程學系，目前為 React 前端工程師。
將在這邊紀錄些學習筆記或分享生活，還請不吝嗇多指教 (｡・ω・｡)
`;

const AboutMe = () => {
  const description = pageText;
  return (
    <div>
      <SEO title="About" description={description} path="" keywords={['Tiffany', '霖LiN', 'Javascript', 'ReactJS']} />
      <h1 className="titleSeparate">About Me</h1>
      <p className={style.about}>{pageText}</p>
    </div>
  );
};
export default AboutMe;
