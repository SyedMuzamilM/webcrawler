import fetch from "node-fetch";
import * as cheerio from "cheerio";
import * as fs from "fs";
import path = require('path')
import parse = require("url-parse");

const args = process.argv.slice(2)

// stores the crawled webpages
const seenUrls = {};

// used to get the full url.
const getUrl = (link, host, protocol) => {
    if (link.includes("http" || "https")) {
        return link;
    } else if (link.startsWith("/")) {
        return `${protocol}//${host}${link}`;
    } else {
        return `${protocol}//${host}/${link}`;
    }
};

const crawl = async ({ url, ignore }) => {
    if (seenUrls[url]) return;

    console.log("crawling", url);
    seenUrls[url] = true;

    const { host, protocol } = parse(url)

    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);
    const links = $("a")
        .map((i, link) => link.attribs.href)
        .get();

    const imageUrls = $('img')
        .map((i, link) => link.attribs.src)
        .get()


    imageUrls.forEach(imageUrl => {
        fetch(getUrl(imageUrl, host, protocol)).then(response => {
            const filename = path.basename(imageUrl)
            const dest = fs.createWriteStream(`images/${filename}`)
            response.body.pipe(dest)
        })


        // For each link it will repeate the same process
        links
            .filter(link => link.includes(host) && !link.includes(ignore))
            .forEach((link) => {
                crawl({
                    url: getUrl(link, host, protocol),
                    ignore
                });
            });
    }
crawl({
        url: args[0],
        ignore: args[1],
    })