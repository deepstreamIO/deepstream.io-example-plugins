import { Deepstream } from '@deepstream/server'

export const deepstream = new Deepstream({
    auth: [{
        path: './auth/token-authentication',
        options: {}
    }]
})

deepstream.start()
