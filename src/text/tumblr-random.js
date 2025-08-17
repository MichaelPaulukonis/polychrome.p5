// based on https://github.com/razagill/tumblr-random-posts
import cheerio from 'cheerio'
const postCount = 20

const cleanup = text => text
  .replace(/\s/g, ' ')
  .replace(/–/g, '--')

const tumblrRandomPost = () => {
  if (process.env.NODE_ENV === 'test') {
    return Promise.resolve(['mocked response'])
  }
  const settings = {
    blogName: 'poeticalbot.tumblr.com',
    appKey: 'soMpL6oJLZq5ovoVYVzU5Qhx5DE87MMrxou6J7tGYLec6XeT6L',
    debug: false
  }
  return new Promise((resolve, reject) => {
    const apiUrl = 'https://api.tumblr.com/v2/blog/' + settings.blogName + '/posts?api_key=' + settings.appKey
    fetch(apiUrl)
      .then(res => res.json())
      .then((response) => {
        const rndPost = Math.floor(Math.random() * response.response.total_posts)
        return rndPost
      }, (err) => {
        reject(err)
      })
      .then(postId =>
        fetch(apiUrl + `&offset=${postId}&limit=${postCount}`)
          .then(res => res.json())
          .then((response) => {
            const newCorpus = response.response.posts.map((post) => {
              const body = cheerio.load(post.body)
              // also post.url, post.title
              return cleanup(body.text())
            })
            resolve(newCorpus)
          }))
  })
}

export default tumblrRandomPost
