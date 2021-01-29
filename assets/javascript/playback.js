const print = obj => console.log(JSON.stringify(obj))

let prevConfig = {}
const playScript = (script, p5) => {
  const origParams = { ...p5.params }
  script.forEach((cmd) => {
    switch (cmd.action) {
      case 'paint':
        p5.draw(cmd.x, cmd.y, true)
        break

      case 'config':
        const newConf = { ...prevConfig, ...cmd.config }
        prevConfig = newConf
        p5.params = { ...p5.params, ...newConf }
        break

      default:
        print('unknown action')
    }
  })
  p5.params = { ...origParams }
}

export {
  playScript
}
