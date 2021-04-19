import React from 'react';
import moment from 'moment';
import { Link } from 'gatsby';
import style from '../PostCard/postCard.module.less';
import Utils from '../../utils/pageUtils';

const levelMap = { hard: '★★★', medium: '★★', easy: '★' };
const PostCard = (props) => {
  const {
    data: {
      node: { frontmatter = { tags: [] } },
    },
  } = props;

  return (
    <div className={style.postCard2}>
      <Link to={Utils.resolvePageUrl(frontmatter.path)}>
        <div>
          <div>
            <span className={style.dateHolder}>
              {frontmatter.date ? moment(frontmatter.date).format('YYYY/MM/DD') : ''}
            </span>
            <span className={style.group}>{frontmatter.tags[0]}</span>
          </div>
          <h3>
            {frontmatter.title}
            <span className={style.level}>{levelMap[frontmatter.tags[1]]}</span>
          </h3>
        </div>
      </Link>
    </div>
  );
};

export default PostCard;
