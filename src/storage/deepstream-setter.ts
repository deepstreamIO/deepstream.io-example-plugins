import { Deepstream } from '@deepstream/server'
import FileStorage from './file-storage'

const deepstream = new Deepstream({})

deepstream.set('storage', new FileStorage({
    directory: '.'
}, deepstream.getServices()))

deepstream.start()
