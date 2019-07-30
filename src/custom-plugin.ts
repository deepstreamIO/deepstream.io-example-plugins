import { TOPIC, EVENT_ACTION } from '@deepstream/protobuf/dist/types/all'
import { DeepstreamPlugin, ConnectionListener, DeepstreamServices, SocketWrapper, EVENT } from '../ds-types/src'

// The options your plugin can expect
interface CustomPluginOptions {
    requiredProperty: string
}

/**
 * This plugin will log the handshake data on login/logout and send a custom event to the logged-in
 * client.
 */
export default class CustomPlugin extends DeepstreamPlugin implements ConnectionListener {
    // This will be shown in deepstream startup logs, recommended to insert version
    public description = 'My Custom Plugin'
    // This will create a thing wrapper around the default logger with the CUSTOM_PLUGIN namespace
    private logger = this.services.logger.getNameSpace('CUSTOM_PLUGIN')

    // You need the constructor to access the plugin options and services. Please note that when creating
    // your own plugin via NodeJS and not via the config file you'll need to call the constructor yourself,
    // but I would recommend sticking to this API!
    constructor (private options: CustomPluginOptions, private services: DeepstreamServices) {
        super()
    }

    /**
     * An optional API to avoid implementing things inside of the constructor. Best place to access deepstream services.
     */
    public init () {
        if (typeof this.options.requiredProperty !== 'string') {
            // This will inform deepstream a fatal error occured and will shutdown the server. This can be triggered at
            // any point of the plugin lifetime, and is useful for informing deepstream a unrecoverable event occured like
            // losing the connection to a cache or database
            this.logger.fatal('Invalid or missing "requiredProperty"')
        }
    }

    /**
     * This is actually in the super class (DeepstreamPlugin) and if your plugin is sync doesn't need to be implemented.
     * If your plugin is async you need to make sure this only returns when its complete. To make the point clear I made
     * it async by just putting in a timeout. This is used to ensure the connection to a database or startup of a server
     * is complete before deepstream launched.
     */
    public async whenReady (): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, 1000))
    }

    /**
     * Same as whenReady, except on deepstream shutdown instead of startup.
     */
    public async close (): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, 1000))
    }

    /**
     * This is called when client is authenticated with a SocketWrapper. This is a powerful little wrapper
     * that abstracts away all the IO calls and allows you to interact directly via the socket regardless
     * of the underlying implementation. Please note that this is only called after a client is authenticated!
     * Unauthenticated clients don't leave the scope of the connection-endpoint in order to minimize logic.
     *
     * This call also has to be supported by the connection-endpoint. For example we don't consider a HTTP
     * request authenticated request to count as an actual client, so this will only be called via websockets.
     */
    public onClientConnected (socketWrapper: SocketWrapper): void {
        // Note we are using the namespaced logger instead of the one on `this.services.logger`
        this.logger.info(EVENT.INFO, `User logged in with handshake data: ${JSON.stringify(socketWrapper.getHandshakeData())}`)

        // This is a cheeky/advanced example of how you can use the SocketWrapper to directly send messages. As
        // users needs progress we will instead be creating official hooks going forward.
        socketWrapper.sendMessage({
            topic: TOPIC.EVENT,
            action: EVENT_ACTION.EMIT,
            name: 'user-connected',
            parsedData: {
                how: 'Due to events nature, you can pretty much emit them without any issues!'
            }
        })
    }

    /**
     * This is called when an authenticated client disconnects
     */
    public onClientDisconnected (socketWrapper: SocketWrapper): void {
        this.logger.info(EVENT.INFO, `User logged in with handshake data: ${JSON.stringify(socketWrapper.getHandshakeData())}`)
    }
}
