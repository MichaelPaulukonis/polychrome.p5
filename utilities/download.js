const { ImageDownloader } = require('google-image-downloader/dist/ImageDownloader.js')

console.log(__dirname)

const downloader = ImageDownloader(__dirname)

downloader.downloadImages('CMYK', 5)
