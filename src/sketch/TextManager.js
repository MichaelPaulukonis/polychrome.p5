export default class TextManager {
  constructor (text) {
    var defaultText = 'These are the pearls that were his eyes'
    // var randomText = defaultText + '...........---___*****xxx                                            '
    var SPLIT_TOKENS = '[ ?.,;:<>()"!\n]'
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
      return self.w.charAt(Math.floor(Math.random() * self.w.length))
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
      // words loses the split chars
      // thus, word mode (with same-color for whole word) has no spaces
      // uh..... neat, but would prefer that as an option?
      // words = self.w.replace(/\n/g, '').split(new RegExp(SPLIT_TOKENS, 'g'))
      words = self.w.replace(/\n/g, '').match(/\w+|\s+|[^\s\w]+/g)
      wordIndex = 0
      charIndex = 0
    }

    self.setText(text || defaultText)
  }
}
