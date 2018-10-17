const fs = require("fs")
const superAgent = require('superagent')
const https = require('https')
const readline = require('readline')
const articlesUrl = 'https://time.geekbang.org/serv/v1/column/articles'
const cookie = '_ga=GA1.2.1253615022.1534763109; GCID=bfdb06e-aa86712-22e25b0-4d38279; _gid=GA1.2.1846922966.1539621889; _gat=1; GCESS=BAIEZwrGWwQEAC8NAAoEAAAAAAsCBAABBNd5EgAHBCY.b4MFBAAAAAAJAQEMAQEDBGcKxlsGBFfIgmUIAQM-; SERVERID=97796d411bb56cf20a5612997f113254|1539705487|1539702674'
const folder = '快速上手Kotlin开发'

const getArticles = (url, payload) => {
  superAgent
    .post(url)
    .type('application/json')
    .set('Origin', 'https://time.geekbang.org')
    .set('Cookie', cookie)
    .send(payload)
    .end(function(err, res) {
      const resData = JSON.parse(res.text)
      const list = resData.data.list
      list.forEach(each => getVideos(each))
    })
}

const getVideos = data => {
  const { article_title } = data
  const url = data.video_media_map.sd.url
  const category = `/Users/wjeek/Downloads/jike_download/videos/${folder}/${article_title}`
  const videoCategoryStream = fs.createWriteStream(`${category}.txt`)
  const videoStream = fs.createWriteStream(`${category}.ts`, {'flags': 'a'})

  getVideosParts(url, videoCategoryStream, parts => {
    console.log(`start: ${article_title}`)
    downloadParts(parts, videoStream, 0)
  })
}

const getVideosParts = (url, file, callback) => {
  https.get(url, res => {
    res.on('data', data => {
      file.write(data)
    }).on('end', () => {
      file.end()

      const fRead = fs.createReadStream(file.path)
      const objReadline = readline.createInterface({
        input: fRead,
      })
      const arr = []
      objReadline.on('line', line => {
        if (line.indexOf('ts') > -1) {
          arr.push(url.replace('sd.m3u8',line))
        }
      })
      objReadline.on('close', () => {
        callback(arr)
      })
    })
  })
}

const downloadParts = (parts, file, index) => {
  https.get(parts[index], res => {
    res.on('data', data => {
      file.write(data)
    }).on('end', () => {
      if (index < parts.length - 1) {
        downloadParts(parts, file, index + 1)
      } else {
        console.log(`end: ${file.path}`)
        file.end()
      }
    })
  })
}

getArticles(articlesUrl, {
  cid: '105',
  order: 'earliest',
  prev: 0,
  sample: true,
  size: 200
})