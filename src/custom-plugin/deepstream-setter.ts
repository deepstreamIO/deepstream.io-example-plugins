import { Deepstream } from '@deepstream/server'
import CustomPlugin from './custom-plugin'

const deepstream = new Deepstream({})

deepstream.set('plugins', {
    custom: new CustomPlugin({
        requiredProperty: 'string'
    }, deepstream.getServices())
})

deepstream.start()
