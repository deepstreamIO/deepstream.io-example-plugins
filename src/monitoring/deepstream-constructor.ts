import { Deepstream } from '@deepstream/server'

export const deepstream = new Deepstream({
    monitoring: {
        path: './monitoring/http-monitoring',
        options: {
            url: '/monitoring'
        }
    }
})

deepstream.start()
