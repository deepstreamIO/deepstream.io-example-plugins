import { DeepstreamPlugin, ConnectionListener, DeepstreamServices, SocketWrapper, EVENT } from '@deepstream/types'
import { TOPIC, EVENT_ACTION } from '@deepstream/protobuf/dist/types/all';

interface CustomPluginOptions {

}

export default class CustomPlugin extends DeepstreamPlugin implements ConnectionListener {
    public description: 'My Custom Plugin';
    private logger = this.services.logger.getNameSpace('CUSTOM_PLUGIN')

    constructor (pluginOptins: CustomPluginOptions, private services: DeepstreamServices) {
        super()
    }

    // This is called when client is authenticated, not just connected!
    onClientConnected(socketWrapper: SocketWrapper): void {
        this.logger.info(EVENT.INFO, `User logged in with handshake data: ${socketWrapper.getHandshakeData()}`)

        socketWrapper.sendMessage({
            topic: TOPIC.EVENT,
            action: EVENT_ACTION.EMIT,
            name: 'user-connected',
            parsedData: {
                how: 'Due to events nature, you can pretty much emit them without any issues!'
            }
        })
    }

    onClientDisconnected(socketWrapper: SocketWrapper): void {
        this.logger.info(EVENT.INFO, `User logged in with handshake data: ${socketWrapper.getHandshakeData()}`)
    }
}