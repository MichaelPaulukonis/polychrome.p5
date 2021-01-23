const print = obj => console.log(JSON.stringify(obj))

let prevConfig = {}
const playScript = (script, p5) => {
  script.forEach((cmd) => {
    switch (cmd.action) {
      case 'paint':
        // TODO: call paint of sketch
        p5.draw(cmd.x, cmd.y, true)
        // print(`painted with x: ${cmd.x} y: ${cmd.y}`)
        break

      case 'config':
        const newConf = { ...prevConfig, ...cmd.config }
        prevConfig = newConf
        // TODO: update params of sketch
        p5.params = { ...p5.params, ...newConf }
        // print('updated config')
        break

      default:
        print('unknown action')
    }
  })
}

export {
  playScript
}
