import { Deepstream } from '@deepstream/server'
import VerticalClusterNode from './vertical-cluster-node'

const deepstream = new Deepstream({})

deepstream.set(
    'clusterNode', 
    new VerticalClusterNode({}, deepstream.getServices(), deepstream.getConfig())
)

deepstream.start()
