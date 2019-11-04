import { Deepstream } from '@deepstream/server'
import NodeCache from './node-cache';

const deepstream = new Deepstream({})

deepstream.set('cache', new NodeCache({}, deepstream.getServices()))

deepstream.start()
