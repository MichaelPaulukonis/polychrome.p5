class TextManager {
  constructor (text) {
    var defaultText = 'These are the pearls that were his eyes'
    var randomText = defaultText + '...........---___*****xxx                                            '
    var SPLIT_TOKENS = ' ?.,;:[]<>()"'
    var words = []
    var charIndex = 0
    var wordIndex = 0
    this.w = text || defaultText
    words = splitTokens(this.w, SPLIT_TOKENS)
    // getchar and getWord indexes are not yoked together
    this.getchar = function () {
      var c = this.w.charAt(charIndex)
      charIndex = (charIndex + 1) % this.w.length
      return c
    }
    this.getcharRandom = function () {
      var c = randomText.charAt(random(randomText.length))
      return c
    }
    this.getWord = function () {
      var word = words[wordIndex]
      wordIndex = (wordIndex + 1) % words.length
      return word
    }
    this.getText = function () {
      return this.w
    }
  }
  setText (text) {
    this.w = text
  }
}
