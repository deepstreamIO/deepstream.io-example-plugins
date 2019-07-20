import { DeepstreamPlugin, DeepstreamServices, DeepstreamMonitoring, LOG_LEVEL, EVENT } from '@deepstream/types'
import { Message } from '@deepstream/protobuf/dist/types/messages';
import { TOPIC, STATE_REGISTRY_TOPIC } from '@deepstream/protobuf/dist/types/all';
import { Server } from 'http'

interface HTTPMonitoringOptions {
    host: string,
    port: number
}

export default class HTTPMonitoring extends DeepstreamPlugin implements DeepstreamMonitoring {
    public description: 'File Storage'
    private logger = this.services.logger.getNameSpace('HTTP_MONITORING')
    private server = new Server()
    
    private errorLogs = new Map<EVENT, number>()
    private recieveStats = new Map<TOPIC | STATE_REGISTRY_TOPIC, number>()
    private sendStats = new Map<TOPIC | STATE_REGISTRY_TOPIC, number>()
    private loginStats = new Map<string, {
        allowed: number,
        declined: number
    }>()

    constructor (private pluginOptions: HTTPMonitoringOptions, private services: DeepstreamServices) {
        super()

        // on get
    }

    public async whenReady (): Promise<void> {
        return new Promise(resolve => {
            this.server.listen(this.pluginOptions.port, this.pluginOptions.host, () => resolve())
        })
    }

    public async close (): Promise<void> {
        return new Promise(resolve => {
            this.server.close(() => resolve())
        })
    }

    public onErrorLog(loglevel: LOG_LEVEL, event: EVENT, logMessage: string): void {
        let count = this.errorLogs.get(event)
        if (!count) {
            this.errorLogs.set(event, 1)
        } else {
            this.errorLogs.set(event, count + 1)
        }
    }

    public onLogin(allowed: boolean, endpointType: string): void {
        let stats = this.loginStats.get(endpointType)
        if (!stats) {
            stats = { allowed: 0, declined: 0 }
            this.loginStats.set(endpointType, stats)
        }
        allowed ? stats.allowed++ : stats.declined++
    }

    public onMessageRecieved(message: Message): void {
        let current = this.recieveStats.get(message.topic)
        if (!current) {
            this.recieveStats.set(message.topic, 1)
        } else {
            this.recieveStats.set(message.topic, current + 1)
        }
    }

    public onMessageSend(message: Message): void {
        let current = this.sendStats.get(message.topic)
        if (!current) {
            this.sendStats.set(message.topic, 1)
        } else {
            this.sendStats.set(message.topic, current + 1)
        }
    }

    public onBroadcast(message: Message, count: number): void {
        let current = this.sendStats.get(message.topic)
        if (!current) {
            this.sendStats.set(message.topic, 1)
        } else {
            this.sendStats.set(message.topic, current + 1)
        }
    }

}