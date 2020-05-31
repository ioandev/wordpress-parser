const cheerio = require('cheerio')
const {
    Parser
} = require("htmlparser2");
const {
    DomHandler
} = require("domhandler");

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

function contentConvertor(data, isPost) {
    let urlAndSize = function (data) {
        if (data == null)
            return null
        return {
            url: data.source_url,
            width: data.width
        }
    }

    return data.map(post => {
        // TODO: can be a non picture.. need to check with another featured media type. does my template even handle it now anyway?

        var featuredMedia = post._embedded['wp:featuredmedia']

        let thumbnails = []
        if (featuredMedia) {
            thumbnails = featuredMedia.map(media => {
                try {
                    let sizes = media.media_details.sizes
                    let details = {
                        thumbnail: urlAndSize(sizes.thumbnail),
                        medium: urlAndSize(sizes.medium),
                        medium_large: urlAndSize(sizes.medium_large),
                        full: urlAndSize(sizes.full)
                    }

                    return {
                        caption: media.caption.rendered,
                        details: details
                    }
                } catch (e) {
                    console.error(`Couldn't parse thumbnails for slug ${post.slug}`)
                    return {}
                }
            })
        }

        const $ = cheerio.load(post.content.rendered)

        let content = $.children

        // const
        let rawHtml = post.content.rendered

        const handler = new DomHandler(function (error, dom) {
            if (error) {
                // Handle error
            } else {
                // Parsing completed, do something
                console.log(dom);
                let subli = sublime({
                    name: 'main',
                    type: 'main',
                    children: dom
                })
                content = subli
                console.log(subli);
            }
        });

        const parser = new Parser(handler);
        parser.write(rawHtml);
        parser.end();


        return {
            //title: htmlToText.fromString(post.title.rendered),
            title: decodeURIComponent(post.title.rendered),
            title: entities.decode(post.title.rendered),
            html: post.content.rendered,
            json: content,
            slug: post.slug,
            thumbnails: thumbnails,
            created_at: post.date_gmt,
            isPost: isPost
        }
    })
    //content.rendered
    //slug
    //title.rendered
    //_embeded.wp:featuredmedia[]
    ///caption.rendered
    ///media_details
    ///-.sizes
    ///-.thumbnail, medium, medium_large, full
    ///-.source_url, width
}

function sublime(parent) {
    if (parent.data == undefined && parent.name == undefined)
        return null;

    if (parent.data != undefined && parent.data.trim() == "")
        return null;

    var children = []
    if (parent.children != undefined) {
        parent.children.forEach(child => {
            children.push(sublime(child))
        });
    }
    if (parent.type == "tag" && parent.children != undefined && parent.children.length == 1 && parent.children[0].type != "tag") {
        children = [],
            parent.data = parent.children[0].data
    }

    var result = {
        name: parent.name,
        data: parent.data
    }
    if (result.data != undefined) { // && result.name != "pre" && result.name != "code") { 
        //result.data = htmlToText.fromString(result.data)
        //result.data = decodeURIComponent(result.data)
        result.data = entities.decode(result.data)
    }

    children = children.filter(child => child != null)
    if (children.length != 0) {
        result.children = children
    }
    if (parent.attribs != undefined && Object.keys(parent.attribs).length != 0) {
        result.attribs = parent.attribs
    }

    return result
}

export default contentConvertor;