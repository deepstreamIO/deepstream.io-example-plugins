import { Deepstream } from '@deepstream/server'

export const deepstream = new Deepstream({
    logger: {
        path: './logger/pino-logger',
        options: {}
    }
})

deepstream.start()
