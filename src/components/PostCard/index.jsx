import React from 'react';
import moment from 'moment';
import { Link } from 'gatsby';
import style from './postCard.module.less';
import Utils from '../../utils/pageUtils';
import { tags } from '../../../config';

const PostCard = (props) => {
  const {
    data: {
      node: { frontmatter = { tags: [] } },
    },
  } = props;

  return (
    <div className={style.postCard}>
      <Link to={Utils.resolvePageUrl(frontmatter.path)}>
        <div
          className={style.postCardText}
          style={{
            backgroundColor: tags[frontmatter.tags[0]].color,
          }}
        >
          {frontmatter.title}
          <span className={style.dateHolder}>
            {frontmatter.date ? moment(frontmatter.date).format('YYYY/MM/DD') : ''}
          </span>
        </div>
      </Link>
      <div className={style.mrTp20}>
        <p className={style.excerpt}>{frontmatter.excerpt}</p>
        <p>
          {frontmatter.tags.map((tag) => (
            <Link key={tag} className={style.tag} to={`/tags/${tag}`}>{`#${tag} `}</Link>
          ))}
        </p>
      </div>
    </div>
  );
};

export default PostCard;
