'use strict';
const http = require('http');
const url = require('url');
const cheerio = require('cheerio')
let pageIndex = 2;
let count = 0;

let $ = cheerio.load('<h2 class="title">Hello world</h2>')

function sendRequest(tmpurl, callback) {
    let options = {
        protocal: 'http',
        hostname: url.parse(tmpurl).hostname,
        port: '80',
        path: url.parse(tmpurl).path
    }
    let client = http.request(options, (res) => {
        res.setTimeout(99999);
        let html = '';
        res.on('data', (data) => {
            html += data;
        });
        res.on('end', () => {
            setTimeout(() => {
                callback(html)
            }, 1000);

        })
    });
    client.end();
}

function sleep(d) {
    for (var t = Date.now(); Date.now() - t <= d;);
}
//list_6_2.html
function firstRequest(url) {
    beginWork(url);
}

function beginWork(url) {
    return sendRequest(url, (html) => {
        let $ = cheerio.load(html);
        let tagas = $('.list-left.public-box > dd').find(':not(.page) a'); //图片目录
        for (var i = 0; i < tagas.length; i++) {
            sendRequest(tagas[i].attribs.href, (html) => { //获取图片列表
                //获取所有图片url
                let $ = cheerio.load(html);
                let pageAs = $('.content-page').find(':not(.page-ch) a'); //每张图片
                //循环获取图片
                for (var i = 0; i < pageAs.length; i++) {
                    let tmpUrl = 'http://www.mm131.com/xinggan/' + pageAs[i].attribs.href;
                    sendRequest('http://www.mm131.com/xinggan/' + pageAs[i].attribs.href, (html) => {
                        let $ = cheerio.load(html);

                        let ele = $('.content-pic').find('img')[0];
                        if (!ele) return;
                        let src = ele.attribs.src;
                        // console.log(tmpUrl)
                        getPic(src, (obj) => {
                            require('fs').writeFileSync('./img/' + obj.path, obj.buf, 'binary');
                            console.log('完成:' + tmpUrl + ',' + obj.path + '合计:' + (++count))
                        });
                    });
                }

            });
        }

    });
}

function getPic(tmpurl, callback) {
    let options = {
        protocal: 'http',
        hostname: url.parse(tmpurl).hostname,
        port: '80',
        path: url.parse(tmpurl).path
    }
    let client = http.request(options, (res) => {

        res.setTimeout(10000);
        res.socket.on('error', (err) => {
            console.log(err);
        });
        res.setEncoding("binary");
        let totalData = '';
        res.on('data', (data) => {
            totalData += data;
        });
        res.on('end', () => {
            setTimeout(() => {
                callback({ path: Date.now() + '.jpg', buf: totalData })
            }, 1000);
        })
    });
    client.setTimeout(99999);
    client.on('error', (err) => {
        client.end();
        console.log(err)
    })
    client.end();
}
firstRequest('http://www.mm131.com/xinggan/');

process.on('uncaughtException', (err) => {
    console.log(err);
})
