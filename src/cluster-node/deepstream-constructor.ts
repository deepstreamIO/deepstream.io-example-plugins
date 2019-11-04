import { Deepstream } from '@deepstream/server'

export const deepstream = new Deepstream({
    clusterNode: {
        path: './cluster-node/vertical-cluster-node',
        options: {}
    }
})

deepstream.start()
