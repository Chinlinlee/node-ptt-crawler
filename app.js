const nodeFech = require('node-fetch');
const tough = require   ('tough-cookie');
const pttUrl = `https://www.ptt.cc`
let cookie = new tough.Cookie();
cookie.key = 'over18';
cookie.value = 1;
let cookieJar = new tough.CookieJar();
cookieJar.setCookieSync(cookie , pttUrl );
const fetch = require('fetch-cookie')(nodeFech , cookieJar );
const cheerio = require('cheerio');
const myConf = require('./config');
const _ = require('lodash');
const fs = require('fs');
const xlsx = require('excel4node');


let pttPostUrls = [];
let users= [];
let articles = [];
let lastPage = 0;
async function getLastPage (category) {
    let option = {
        "url" : `https://www.ptt.cc/bbs/${category}/index.html`
    }
    let res = await fetch(option.url);
    let resText = await res.text();
    let $ = cheerio.load(resText);
    let aTag = $('a');
    for (let i in aTag) {
        let item = aTag[i];
        let text = _.get(item , "children[0].data") || "";
        if (text.includes('上頁')) {
            lastPage = item.attribs.href.match(/\d+/gm)[0];
            return;
        }
    }
}
async function fetchPttPostUrl(category ,page = "") {
    let option = {
        "url" : `https://www.ptt.cc/bbs/${category}/index${page}.html`
    }
    let res = await fetch(option.url);
    let resText = await res.text();
    let $ = cheerio.load(resText);
    let title = $('.title');
    for (let i in title) {
        let item = title[i];
        let a = _.filter(item.childNodes , v=> v.name =='a');
        let hrefList = [...a];
        for (let x in hrefList) {
            let hrefItem = hrefList[x];     
            if (!hrefItem.children[0].data.includes("公告")) {
                pttPostUrls.push(hrefItem.attribs.href);
            }
        }
    }
} 
async function fetchPttArticle (pageUrl) {
    let url = `${pttUrl}${pageUrl}`;
    let res = await fetch(url);
    let resText = await res.text();
    let $ = cheerio.load(resText);
    let author =$('.article-metaline .article-meta-value');
    let authorName = _.get(author[0] , 'childNodes[0].data');
    let articleTitle = _.get(author[1] , 'childNodes[0].data');
    //去除 作者名稱的括號以及空白
    authorName = authorName.replace(/ \((.*?)\)/, "");
    let mainContent = $("#main-content");
    /*
        作者標頭
        內文
        --
        留言
        最重要的就是--
    */
    let articleContent =mainContent.text().split('--')[0];
    articleContent = articleContent.split("\n");
    articleContent = _.drop(articleContent , 2);
    articleContent = articleContent.join("\n");
    let articleObj = {
        author :authorName ,
        title : articleTitle ,
        content : articleContent
    }
    articles.push(articleObj);
    users.push(authorName);
}

async function main () {
    for (let j  = 0 ; j < myConf.length ; j++) {
        ;
        articles = [];
        articles.length = 0;
        pttPostUrls = [];
        pttPostUrls.length = 0;
        let item = myConf[j];
        let category = item.category;
        console.log(`開始抓取 ${category} 看板`);
        await getLastPage(category);
        await fetchPttPostUrl(category , "");
        for (let i = 1 ;i < item.pages ; i++) {
            await fetchPttPostUrl(category , lastPage-i);
        }
        for (url of pttPostUrls) {
            await fetchPttArticle(url);
        }
        try {
            console.log("各文章網址:");
            console.log(pttPostUrls);
            generateXlsx(category ,articles);
            console.log(`已儲存${category}.xlsx`);
        } catch (e) {
            console.error(e);
        }
    }
}

async function generateXlsx(wsName ="sheet" , value) {
    
    let wb = new xlsx.Workbook();
    let style = wb.createStyle ({
        font : {
            size : 12 
        }
    });
    let ws = wb.addWorksheet(wsName);
    let title = ['author' , 'title' , 'content'];
    ws.cell(1,1).string("作者").style(style);
    ws.cell(1,2).string("標題").style(style);
    ws.cell(1,3).string("文章內容").style(style);
    for (let i = 1 ; i <= 3 ; i++) {
        for (let j = 2 ; j < value.length ; j++) {
            let nowTitle =title[i-1]; 
            ws.cell(j , i).string(value[j-2][nowTitle]).style(style);
        }
    }
    wb.write(`${wsName}.xlsx`);
}
main();

