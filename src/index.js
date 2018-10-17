const fs = require("fs")
const superAgent = require('superagent')
const articlesUrl = 'https://time.geekbang.org/serv/v1/column/articles'
const articleUrl = 'https://time.geekbang.org/serv/v1/article'
const cookie = '_ga=GA1.2.1253615022.1534763109; GCID=bfdb06e-aa86712-22e25b0-4d38279; _gid=GA1.2.1846922966.1539621889; GCESS=BAIEZwrGWwQEAC8NAAoEAAAAAAsCBAABBNd5EgAHBCY.b4MFBAAAAAAJAQEMAQEDBGcKxlsGBFfIgmUIAQM-; _gat=1; SERVERID=fe79ab1762e8fabea8cbf989406ba8f4|1539754741|1539754721'
const folder = '技术领导力300讲'
const maxConcurrency = 50

const getArticles = (url, payload) => {
  superAgent
    .post(url)
    .type('application/json')
    .set('Origin', 'https://time.geekbang.org')
    .set('Cookie', cookie)
    .send(payload)
    .end(function(err, res) {
      const resData = res.body
      const list = resData.data.list
      const lengthPart = Math.ceil(list.length / maxConcurrency)

      // 请求并发量为100， 否则会返回451错误
      list.forEach((each, index) => {
        if (index < maxConcurrency) {
          getArticle(each)
        }
      })

      for (let i = 0; i < lengthPart - 1; i++) {
        setTimeout(() => {
          list.forEach((each, index) => {
            if (index >= (i + 1) * maxConcurrency && index < (i + 2) * maxConcurrency) {
              getArticle(each)
            }
          })
        }, 1000 * (i + 1))
      }
    })
}

const getArticle = data => {
  const { article_title, id } = data
  const payload = { id }
  superAgent
    .post(articleUrl)
    .type('application/json')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json, text/plain, */*')
    .set('Accept-Encoding', 'gzip, deflate, br')
    .set('Accept-Language', 'zh-CN,zh;q=0.9,en;q=0.8')
    .set('Origin', 'https://time.geekbang.org')
    .set('Host', 'time.geekbang.org')
    .set('Cookie', cookie)
    .set('Referrer-Policy', 'no-referrer-when-downgrade')
    .set('Connection', 'keep-alive')
    .set('Referrer', 'https://time.geekbang.org')
    .set('Sec-Metadata', 'destination="", target=subresource, site=same-origin')
    .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36')
    .send(payload)
    .end(function(err, res) {
      if (err) {
        console.log(err)
        return
      }
      const resData = res.body.data
      const content = resData.article_content
      saveArticle(content, article_title)
    })
}

const saveArticle = (data, title) => {
  const encodeTitle = title.replace(/\//g, '-')
  const content = `<!DOCTYPE html><html><head><title>${encodeTitle}</title></title></head></head><body>${data.replace('↵','')}</body></html>`
  fs.writeFile(`/Users/wjeek/Downloads/jike_download/${folder}/${encodeTitle}.html`, content, err => {
    if (err) throw err
    console.log(`${title}---saved`) //文件被保存
  })
}

getArticles(articlesUrl, {
  cid: '79',
  order: 'earliest',
  prev: 0,
  sample: true,
  size: 200
})