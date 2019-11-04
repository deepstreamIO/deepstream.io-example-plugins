import { Deepstream } from '@deepstream/server'

export const deepstream = new Deepstream({
    permission: {
        path: './permission/username-permission',
        options: {}
    }
})

deepstream.start()
