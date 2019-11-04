import { Deepstream } from '@deepstream/server'

export const deepstream = new Deepstream({
    storage: {
        path: './storage/file-storage',
        options: {
            directory: '.'
        }
    }
})

deepstream.start()
