import React from 'react';
import Img from 'gatsby-image';
import { Link } from 'gatsby';
import style from './homepage.module.less';

const Gallery = ({ list }) => (
  <div>
    <h2>{'My Latest Instagram\'s posts'}</h2>
    <div className={style.gallery}>
      {list.map((item, index) => (
        <GalleryItem
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          name={item.node.caption}
          src={item.node.localImage.childImageSharp.fixed}
          link={item.node.permalink}
        />
      ))}
    </div>
  </div>
);

const GalleryItem = ({ src, link }) => (
  <Link to={link}>
    <Img fixed={src} />
  </Link>
);

export default Gallery;
