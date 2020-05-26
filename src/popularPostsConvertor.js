const htmlToText = require('html-to-text');

function popularPostsConvertor(data) {
    return data.map(post => ({
        title: htmlToText.fromString(post.title.rendered),
        slug: post.slug,
        pageviews: post.pageviews
    }))
}

export default popularPostsConvertor;