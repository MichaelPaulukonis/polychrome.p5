class TextManager {
  constructor (text) {
    var defaultText = 'These are the pearls that were his eyes'
    var randomText = defaultText + '...........---___*****xxx                                            '
    var SPLIT_TOKENS = ' ?.,;:[]<>()"'
    var words = []
    var charIndex = 0
    var wordIndex = 0
    let self = this
    self.w = text || defaultText
    words = splitTokens(self.w, SPLIT_TOKENS)
    // getchar and getWord indexes are not yoked together
    self.getchar = function () {
      var c = self.w.charAt(charIndex)
      charIndex = (charIndex + 1) % self.w.length
      return c
    }
    self.getcharRandom = function () {
      var c = randomText.charAt(random(randomText.length))
      return c
    }
    self.getWord = function () {
      var word = words[wordIndex]
      wordIndex = (wordIndex + 1) % words.length
      return word
    }
    self.getText = function () {
      return self.w
    }
  }

  setText (text) {
    this.w = text
  }
}