import React from 'react';
import { Disqus } from 'gatsby-plugin-disqus';

const Comment = ({ pageId, title }) => (
  <Disqus
    config={{
      /* Replace PAGE_URL with your post's canonical URL variable */
      url: `http://localhost:8000/${pageId}`,
      /* Replace PAGE_IDENTIFIER with your page's unique identifier variable */
      identifier: pageId,
      /* Replace PAGE_TITLE with the title of the page */
      title,
    }}
  />
);
export default Comment;
