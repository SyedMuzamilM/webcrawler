import fetch from "node-fetch";
import * as cheerio from "cheerio";
import * as fs from "fs";


// stores the crawled webpages
const seenUrls = {};

// used to get the full url.
const getUrl = (link) => {
    if (link.includes("http://127.0.0.1:5500")) {
        return link;
    } else {
        return "http://127.0.0.1:5500" + link;
    }
};

const crawl = async ({ url }) => {
    // if the url is crawled then it will not crawl that page again
    if (seenUrls[url]) return;

    console.log("crawling", url);
    // adding another url into the seenUrls array as crawled
    seenUrls[url] = true;

    // Fetches the url and then grab the html inside the html variabel
    const response = await fetch(url);
    const html = await response.text();

    // cheerio library loads the html and finds the other links inside the page
    const $ = cheerio.load(html);
    const links = $("a")
        .map((i, link) => link.attribs.href)
        .get();

    console.log(links)
    // It will not work if there are lot of images on the page
    // In our website we only have one image.
    // That is why we used this
    // FIXME: Solve the problem why it is not working
    const imageUrl = $('img').attr('src')
    if (imageUrl != undefined) {

        // fetch the imageUrl and add the image inside the images folder
        fetch(getUrl(imageUrl)).then(response => {
            const image = fs.createWriteStream("images/img.jpg")
            response.body.pipe(image)
        })
    }


    // For each link it will repeate the same process
    links
        .forEach((link) => {
            crawl({
                url: getUrl(link),
            });
        });
};

crawl({
    url: "http://127.0.0.1:5500/html/index.html",
});