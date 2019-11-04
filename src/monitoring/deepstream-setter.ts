import { Deepstream } from '@deepstream/server'
import HTTPMonitoring from './http-monitoring';

const deepstream = new Deepstream({})

deepstream.set('monitoring', new HTTPMonitoring({
    url: '/monitoring'
}, deepstream.getServices()))

deepstream.start()
