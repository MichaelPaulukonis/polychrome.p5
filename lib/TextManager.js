class TextManager {
  constructor (text) {
    var defaultText = 'These are the pearls that were his eyes'
    // var randomText = defaultText + '...........---___*****xxx                                            '
    var SPLIT_TOKENS = ' ?.,;:[]<>()"'
    var words = []
    var charIndex = 0
    var wordIndex = 0
    let self = this
    self.getchar = function () {
      var c = self.w.charAt(charIndex)
      charIndex = (charIndex + 1) % self.w.length
      return c
    }
    self.getcharRandom = function () {
      return self.w.charAt(random(self.w.length))
    }
    self.getWord = function () {
      var word = words[wordIndex]
      wordIndex = (wordIndex + 1) % words.length
      return word
    }
    self.getText = function () {
      return self.w
    }
    self.setText = function (text) {
      self.w = text
      words = splitTokens(self.w, SPLIT_TOKENS)
      wordIndex = 0
      charIndex = 0
    }

    self.setText(text || defaultText)
  }
}
