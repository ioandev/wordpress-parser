const cheerio = require('cheerio')
const {
    Parser
} = require("htmlparser2");
const {
    DomHandler
} = require("domhandler");

const htmlToText = require('html-to-text');
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


        /*
        if (rawHtml.indexOf("code") != -1) {
            let mmmmm = 2
            rawHtml = "<p>We had over 100 branches that needed to be deleted. Here is the script.</p><p>You can open the output in Excel and add some formatting on the keywords <em>month</em> and <em>year</em> if you want to share the output file around. Otherwise just run it!</p><p>PS: Extra points if you name the file <em>git-remove-branches</em> and put in <em>%HOME/bin</em>. You can then do &#8220;git remove-branches&#8221; in whatever repo you are.</p>"
            rawHtml += "<pre class='wp-block-code language-bash code-toolbar'><code>#!/bin/shlet HAS_NO_ARGUMENTS=!$#function print {    if &#91; $HAS_NO_ARGUMENTS -eq 1 ]; then        echo $1    fi}print 'This script prints and then asks you which remote branches to delete.'print 'The local branches won't be deleted and you can recover the ones'print 'deleted by the script.'print 'Usage: git remove-branches or git remove-branches -csv > file.csv'print 'Author: @ioanb7'MERGED=()NOT_MERGED=()SUSPICIOUS=()SUSPICIOUS_INCLUDE_DATE=$(date --date '21 days ago' +'%s')COMMITS_BEHIND_MAX=100function filter {    cat $1 | sed 's/^&#91; \t]/' | grep -v HEAD | grep -vFx origin/master | grep -v dont-delete}function git_show {    echo '$1,$(git show --format='%an %cr' $1 | head -n 1 | sed 's/,/ /2')'}if &#91;&#91; $(git branch | grep \* | cut -d ' ' -f2) != 'master' ]]; then    echo 'Not on master branch'    exit 1fiif &#91;&#91; ! -z $(git diff HEAD) ]]; then    echo 'You've got uncommited changes.'    exit 1fiprint 'Synching..'git fetch --all > /dev/null 2>&amp;1git pull --all > /dev/null 2>&amp;1echo 'MERGED:'for branch in `git branch -r --merged origin/master | filter`; do    git_show $branch    MERGED+=($branch)doneecho 'NOT MERGED (&lt; 100 commits behind or at least 21 days old):'for branch in `git branch -r --no-merged | filter`; do    COMMITS_BEHIND=$(git rev-list --left-right --count origin/master...$branch | grep -o -E '&#91;0-9]+' | head -1)    DATE=$(git show --format='%ct' $branch | head -n 1)    if (($COMMITS_BEHIND > $COMMITS_BEHIND_MAX || $DATE &lt; $SUSPICIOUS_INCLUDE_DATE)); then        git_show $branch        NOT_MERGED+=($branch)    else        SUSPICIOUS+=($branch)    fidoneecho 'SUSPICIOUS:'for branch in ${SUSPICIOUS&#91;@]}; do    git_show $branchdone# delete partif &#91; $HAS_NO_ARGUMENTS ]; then    exit 0fiechoecho 'Deleting merged ones. (${#MERGED&#91;@]})'read -p 'Are you sure? ' -n 1 -rechoif &#91;&#91; $REPLY =~ ^&#91;Yy]$ ]]then    for branch in ${MERGED&#91;@]}; do        git push origin --delete $branch        echo 'Deleted $branch'    donefiecho 'Deleting non-merged ones. (${#NOT_MERGED&#91;@]})'read -p 'Are you sure? ' -n 1 -rechoif &#91;&#91; $REPLY =~ ^&#91;Yy]$ ]]then    for branch in ${NOT_MERGED&#91;@]}; do        git push origin --delete $branch        echo 'Deleted $branch'    donefi#echo 'Skipping suspicious ones. (${#SUSPICIOUS&#91;@]})'exit 0echo 'Deleting suspicious ones. (${#SUSPICIOUS&#91;@]})'read -p 'Are you sure? ' -n 1 -rechoif &#91;&#91; $REPLY =~ ^&#91;Yy]$ ]]then    for branch in ${SUSPICIOUS&#91;@]}; do        git push origin --delete $branch        echo 'Deleted $branch'    donefi</code></pre>"
        }*/

        //rawHtml = "<pre><code class='lol2'>\r\nSomething\r\n\r\nsomethingelse\r\n\r\n</code>\r\n</pre>"



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


    if (parent.name == "pre") {
        let xx = 2;
    }
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