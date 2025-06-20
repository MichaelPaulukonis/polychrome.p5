// eh, maybe some other way of doing/naming this
const hexStringToColors = (lerp) => {
  // based on https://bl.ocks.org/mootari/bfbf01320da6c14f9cba186c581d507d
  return lerp.split('-').map(c => '#' + c)
}

const stops = (color, i, colors) => {
  return color + ' ' + (i * 100 / colors.length) + '%' +
    ',' + color + ' ' + ((i + 1) * 100 / colors.length) + '%'
}
const gradient = colors => 'linear-gradient(90deg,' + colors.map(stops) + ')'

const colorLabel = (label) => {
  label.style.display = 'inline-block'
  const radio = label.children[0]
  radio.nextSibling.remove()
  const span = document.createElement('span')
  span.style.background = gradient(hexStringToColors(radio.value))
  span.style.paddingRight = '4em'
  span.style.marginRight = '.5em'
  label.appendChild(span)
}

// Adds and links labeled radios to select controller, hides select.
// Radios are wrapped inside labels and stored in controller.__radios.
const selectToRadios = (controller) => {
  const wrapper = controller.domElement
  const select = wrapper.children[0]
  // TODO: needs to be 0 when hidden; auto if not
  // wrapper.parentNode.parentNode.style.height = 'auto'
  wrapper.parentNode.parentNode.classList.add('radio-select')
  controller.__radios = Array.prototype.map.call(select.children, function (option, i) {
    const radio = document.createElement('input')
    radio.type = 'radio'
    radio.name = option.name
    radio.value = option.value
    radio.checked = option.selected
    radio.addEventListener('change', (e) => {
      option.selected = true
      // ouch! a reference that doesn't exist yet!
      controller.__select.dispatchEvent(new e.constructor(e.type, e))
    })
    const label = document.createElement('label')
    label.appendChild(radio)
    label.appendChild(document.createTextNode(option.textContent))
    wrapper.appendChild(label)
    return label
  })
  wrapper.removeChild(select)
  return controller
}

export { hexStringToColors, colorLabel, selectToRadios }
