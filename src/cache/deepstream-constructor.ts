import { Deepstream } from '@deepstream/server'

export const deepstream = new Deepstream({
    auth: [{
        path: './cache/node-cache',
        options: {}
    }]
})

deepstream.start()
