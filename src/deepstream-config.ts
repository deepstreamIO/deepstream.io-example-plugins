const pluginType = process.argv[2]
console.log(process.argv)

import { Deepstream } from '@deepstream/server'

const deepstream = new Deepstream(`./${pluginType}/config.yml`)

deepstream.start()
