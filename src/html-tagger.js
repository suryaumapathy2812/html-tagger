const fs = require("fs")
const core = require("@actions/core")
const cheerio = require('cheerio');
const html_score = require("./html-score")

const topics = {
    "level_1": [
        {
            "topic": "Basic structure",
            "tags": ["doctype", "html", "head", "body"],
            "attributes": ["lang", "xml:lang", "xmlns", "manifest"]
        },
        {
            "topic": "Headings and paragraphs",
            "tags": ["h1", "h2", "h3", "h4", "h5", "h6", "p"],
            "attributes": ["class", "id", "style"]
        },
        {
            "topic": "Lists",
            "tags": ["ul", "ol", "li"],
            "attributes": ["type", "start", "value"]
        },
        {
            "topic": "Links",
            "tags": ["a"],
            "attributes": ["href", "target", "download", "rel"]
        },
        {
            "topic": "Images",
            "tags": ["img"],
            "attributes": ["src", "alt", "width", "height"]
        }
    ],
    "level_2": [
        {
            "topic": "HTML5 semantic elements",
            "tags": ["article", "section", "nav", "header", "footer", "aside", "main"],
            "attributes": ["class", "id", "style"]
        },
        {
            "topic": "Tables",
            "tags": ["table", "thead", "tbody", "tr", "th", "td", "caption"],
            "attributes": ["class", "id", "style", "border", "cellspacing", "cellpadding", "summary"]
        },
        {
            "topic": "Forms",
            "tags": ["form", "input", "label", "select", "option", "textarea", "button"],
            "attributes": ["class", "id", "style", "name", "value", "placeholder", "required", "disabled"]
        }
    ],
    "level_3": [
        {
            "topic": "Media elements",
            "tags": ["audio", "video", "source", "track"],
            "attributes": ["src", "type", "autoplay", "loop", "controls"]
        },
        {
            "topic": "Canvas",
            "tags": ["canvas"],
            "attributes": ["class", "id", "style", "width", "height"]
        },
        {
            "topic": "Accessibility",
            "tags": ["aria-*", "role", "alt", "aria-labelledby", "aria-describedby"],
            "attributes": ["aria-*", "role", "alt", "aria-labelledby", "aria-describedby"]
        }
    ]
}

function analyzeHtmlCode(htmlCode) {
    const $ = cheerio.load(htmlCode);

    // Extract all unique tags
    const tags = new Set();
    $('*').each(function () {
        tags.add(this.tagName);
    });

    // Extract all unique attributes
    const attributes = new Set();
    $('*').each(function () {
        Object.keys(this.attribs).forEach((attr) => attributes.add(attr));
    });

    // Count the number of occurrences of each tag
    const tagCounts = {};
    tags.forEach((tag) => {
        tagCounts[tag] = $(tag).length;
    });

    // Count the number of occurrences of each attribute
    const attributeCounts = {};
    attributes.forEach((attr) => {
        attributeCounts[attr] = $(`[${attr}]`).length;
    });

    // Extract all comments
    const comments = [];
    $('*').contents().each(function () {
        if (this.type === 'comment') {
            comments.push(this.data.trim());
        }
    });

    return {
        tags: Array.from(tags),
        attributes: Array.from(attributes),
        tagCounts,
        attributeCounts,
        comments,
    };
}

function readCodebase(directory) {

    const files = fs.readdirSync(directory)
        .filter(file => {

            if (file === 'node_modules') {
                return false;
            } else {
                return true
            }

        });

    const filePaths = []

    files.forEach(file => {
        const filePath = directory + '/' + file;
        const stats = fs.statSync(filePath);

        if (stats.isFile() && file.endsWith('.html')) {
            filePaths.push({ path: filePath })
        } else if (stats.isDirectory()) {
            filePaths.push(...readCodebase(filePath));
        }
    });

    return filePaths
}


function readCodeContent(path) {
    return fs.readFileSync(path, 'utf8')
}



function tagger(rootPath) {

    const htmlFiles = readCodebase(rootPath)
    core.debug(htmlFiles)

    const analyzeReport = htmlFiles.map(({ path }) => {
        const content = readCodeContent(path)
        const maxReport = analyzeHtmlCode(content)
        return { file: path, maxReport }
    })
    core.debug(analyzeReport)

    let tags = []
    let attributes = []
    let tagCount = {}
    let attributeCount = {}

    analyzeReport
        .map(a => a.maxReport)
        .forEach(report => {
            tags.push(...report.tags);
            attributes.push(...report.attributes)

            Object.keys(report.tagCounts)
                .forEach(key => {
                    if (!tagCount[key]) {
                        tagCount[key] = 0
                    }
                    tagCount[key] = tagCount[key] + report.tagCounts[key]
                })

            Object.keys(report.attributeCounts)
                .forEach(attr => {

                    if (!attributeCount[attr]) {
                        attributeCount[attr] = 0
                    }
                    attributeCount[attr] = attributeCount[attr] + report.attributeCounts[attr]
                })

        })

    tags = [...new Set(tags)]
    attributes = [...new Set(attributes)]

    core.debug(tags);
    core.debug(tagCount);
    core.debug(attributes);
    core.debug(attributeCount);

    // Calculate the total score
    const score = html_score.calculateLevelScores(topics, tagCount, attributeCount);
    core.debug('Level Percentages:', score);

    return score
}


module.exports = tagger