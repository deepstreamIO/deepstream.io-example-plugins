import { Deepstream } from '@deepstream/server'
import PinoLogger from './pino-logger'

const deepstream = new Deepstream({})

deepstream.set('logger', new PinoLogger({}, deepstream.getServices()))

deepstream.start()
