import Command, {flags} from '@dxcli/command'
import color from '@heroku-cli/color'
import cli from 'cli-ux'
import * as _ from 'lodash'

let examplePlugins = {
  'heroku-ci': {version: '1.8.0'},
  'heroku-cli-status': {version: '3.0.10', type: 'link'},
  'heroku-fork': {version: '4.1.22'},
}
let bin = 'heroku'
const g = global as any
if (g.config) {
  bin = g.config.bin
  let pjson = g.config.pjson['cli-engine']
  if (pjson.help && pjson.help.plugins) {
    examplePlugins = pjson.help.plugins
  }
}
const examplePluginsHelp = Object.entries(examplePlugins).map(([name, p]: [string, any]) => `    ${name} ${p.version}`)

export default class Plugins extends Command {
  static flags: flags.Input = {
    core: flags.boolean({description: 'show core plugins'})
  }
  static description = 'list installed plugins'
  static help = `Example:
    $ ${bin} plugins
${examplePluginsHelp.join('\n')}
`

  async run() {
    let plugins = this.config.engine!.plugins
    plugins = plugins.filter(p => p.type !== 'builtin' && p.type !== 'main')
    _.sortBy(plugins, 'name')
    if (!this.flags.core) plugins = plugins.filter(p => p.type !== 'core')
    if (!plugins.length) {
      cli.info('no plugins installed')
    }
    for (let plugin of plugins) {
      let output = `${plugin.name} ${color.dim(plugin.version)}`
      if (plugin.type !== 'user') output += color.dim(` (${plugin.type})`)
      if (plugin.type === 'link') output += ` ${plugin.root}`
      else if (plugin.tag !== 'latest') output += color.dim(` (${String(plugin.tag)})`)
      cli.log(output)
    }
  }
}