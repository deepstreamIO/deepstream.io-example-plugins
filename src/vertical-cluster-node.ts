import * as cluster from 'cluster'
import { EventEmitter } from 'events'
import { Message } from '@deepstream/protobuf/dist/types/messages';
import { TOPIC } from '@deepstream/protobuf/dist/types/all';
import { DeepstreamPlugin, DeepstreamClusterNode, DeepstreamServices, DeepstreamConfig } from '@deepstream/types';

if (cluster.isWorker) {
    process.on('message', (serializedMessage) => {
        const { serverName, message }: { serverName: string, message: Message } = JSON.parse(serializedMessage)
        VerticalClusterNode.emitter.emit(TOPIC[message.topic!], message, serverName)
    })
}

if (cluster.isMaster) {
    cluster.on('message', (worker, serializedMessage: string, handle) => {
        for (const id in cluster.workers) {
            const fromWorker = cluster.workers[id]!
            if (fromWorker !== worker) {
                worker.send(serializedMessage)
            }
        }
    })
}

/**
 * This class will allow deepstream to scale vertically using the cluster nodeJS approach. This is a POC,
 * but demonstrates how the API works!
 */
export class VerticalClusterNode extends DeepstreamPlugin implements DeepstreamClusterNode {
    public static emitter = new EventEmitter()
    public description: string = 'Vertical Cluster Message Bus'
    private callbacks = new Map<string, any>()

    constructor (options: any, services: DeepstreamServices, private config: DeepstreamConfig) {
        super()
    }

    /**
     * Broadcast a message to all nodes in the server
     */ 
    public send (message: Message): void {
        process.send!(JSON.stringify({ message, fromServer: this.config.serverName }))
    }

    /**
     * Send a message to a specific version
     */
    public sendDirect (serverName: string, message: Message, metaData?: any): void {
        process.send!(JSON.stringify({ toServer: serverName, fromServer: this.config.serverName, message }))
    }

    /**
     * Subscribe to all messages on a certain topic on the server
     */
    public subscribe<SpecificMessage> (stateRegistryTopic: TOPIC, callback: (message: SpecificMessage, originServerName: string) => void): void {
        this.callbacks.set(TOPIC[stateRegistryTopic], callback)
        VerticalClusterNode.emitter.on(TOPIC[stateRegistryTopic], callback)
    }
}
