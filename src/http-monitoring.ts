import { DeepstreamPlugin, DeepstreamServices, DeepstreamMonitoring, LOG_LEVEL, EVENT } from '@deepstream/types'
import { Message } from '@deepstream/protobuf/dist/types/messages';
import { TOPIC, STATE_REGISTRY_TOPIC } from '@deepstream/protobuf/dist/types/all';
import { Server } from 'http'

interface HTTPMonitoringOptions {
    host: string,
    port: number
}

export default class HTTPMonitoring extends DeepstreamPlugin implements DeepstreamMonitoring {
    public description = `HTTP Monitoring on ${this.options.host}:${this.options.port}`
    private logger = this.services.logger.getNameSpace('HTTP_MONITORING')
    private errorLogs = new Map<EVENT, number>()
    private recieveStats = new Map<TOPIC | STATE_REGISTRY_TOPIC, number>()
    private sendStats = new Map<TOPIC | STATE_REGISTRY_TOPIC, number>()
    private loginStats = new Map<string, {
        allowed: number,
        declined: number
    }>()
    private server: Server

    constructor (private options: HTTPMonitoringOptions, private services: DeepstreamServices) {
        super()
        this.server = new Server(this.onRequest.bind(this))
        this.server.on('error', (error) => {
            this.logger.fatal(`Error: ${error}`)
        })
    }

    public async whenReady (): Promise<void> {
        return new Promise(resolve => {
            // Start the HTTP server, once it's succesfully listening resolve. If an error occurs
            // this will be caught by the general error event and will raise a fatal error with deepstream
            this.server.listen(this.options.port, this.options.host, () => resolve())
        })
    }

    public async close (): Promise<void> {
        return new Promise(resolve => {
            this.server.close(() => resolve())
        })
    }

    /**
     * Called whenever an error log or worse happens on deepstream. This should not be used to log! But it's
     * useful if you want to count granular events.
     * 
     * For example:
     *  - EVENT.AUTH_ERROR
     *  - EVENT.AUTH_RETRY_ATTEMPTS_EXCEEDED
     */
    public onErrorLog(loglevel: LOG_LEVEL, event: EVENT, logMessage: string): void {
        let count = this.errorLogs.get(event)
        if (!count) {
            this.errorLogs.set(event, 1)
        } else {
            this.errorLogs.set(event, count + 1)
        }
    }

    /**
     * Called whenever a login attempt is tried and whether or not it succeeded, as well
     * as the connection-endpoint type, which is provided from the connection endpoint
     * itself
     */
    public onLogin(allowed: boolean, endpointType: string): void {
        let stats = this.loginStats.get(endpointType)
        if (!stats) {
            stats = { allowed: 0, declined: 0 }
            this.loginStats.set(endpointType, stats)
        }
        allowed ? stats.allowed++ : stats.declined++
    }

    /**
     * Called after a message has been recieved and authenticated. You can drill pretty deep
     * into these as you recieve the entire message object.
     * 
     * So that means you have things like:
     *  - The message topic
     *  - The message action
     *  - The properties, such as name, names, data, etc.
     * 
     * As such you can generate really detailed logs! You do not however recieve the SocketWrapper
     * although feel free to request the feature and we can possible add it going forward!
     */
    public onMessageRecieved(message: Message): void {
        let current = this.recieveStats.get(message.topic)
        if (!current) {
            this.recieveStats.set(message.topic, 1)
        } else {
            this.recieveStats.set(message.topic, current + 1)
        }
    }

    /**
     * Called before a single message is sent. You can drill pretty deep
     * into these as you recieve the entire message object.
     * 
     * So that means you have things like:
     *  - The message topic
     *  - The message action
     *  - The properties, such as name, names, data, etc.
     * 
     * As such you can generate really detailed logs! You do not however recieve the SocketWrapper
     * although feel free to request the feature and we can possible add it going forward!
     */
    public onMessageSend(message: Message): void {
        let current = this.sendStats.get(message.topic)
        if (!current) {
            this.sendStats.set(message.topic, 1)
        } else {
            this.sendStats.set(message.topic, current + 1)
        }
    }

    /**
     * Called before a message is sent to multiple users (via the subscription registry). You can drill pretty deep
     * into these as you recieve the entire message object. You also get the count.
     * 
     * So that means you have things like:
     *  - The message topic
     *  - The message action
     *  - The properties, such as name, names, data, etc.
     */
    public onBroadcast(message: Message, count: number): void {
        let current = this.sendStats.get(message.topic)
        if (!current) {
            this.sendStats.set(message.topic, 1)
        } else {
            this.sendStats.set(message.topic, current + 1)
        }
    }


    /**
     * The HTTP request callback, very primitive in this example, just sends out
     * a JSON representation of the data we gathered (as a serialized JS MAP as well!)
     */
    private onRequest(req, res) {
        if (req.type !== 'GET') {
            res.writeHeader(400)
            res.end('Only get supported')
        }
        res.writeHeader(200)
        res.header('Content-Type', 'application/json')
        res.end(JSON.stringify(this.getAndResetMonitoringStats()))
    }

    /**
     * Serialize and reset the monitoring stats
     */
    private getAndResetMonitoringStats () {
        const results = {
            errors: [...this.errorLogs],
            recieved: [...this.recieveStats],
            send: [...this.sendStats],
            logins: [...this.loginStats]
        }
        this.errorLogs.clear()
        this.recieveStats.clear()
        this.sendStats.clear()
        this.loginStats.clear()
        return results
    }

}