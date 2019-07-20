import { DeepstreamPlugin, DeepstreamServices, DeepstreamPermission, PermissionCallback, SocketWrapper } from '@deepstream/types'
import { Message } from '@deepstream/protobuf/dist/types/messages';
import { JSONObject } from '@deepstream/protobuf/dist/types/all';

interface UsernamePermissionOptions {
}

export default class UsernamePermission extends DeepstreamPlugin implements DeepstreamPermission {
    public description: 'Header Authentication';
    private logger = this.services.logger.getNameSpace('USERNAME_PERMISSION')

    constructor (private pluginOptions: UsernamePermissionOptions, private services: DeepstreamServices) {
        super()
    }

    canPerformAction(username: string, message: Message, callback: PermissionCallback, authData: JSONObject, socketWrapper: SocketWrapper, passItOn: any): void {
        if (message.name && message.name.includes(username)) {
            callback(socketWrapper, message, passItOn, null, true)
            return
        }

        callback(socketWrapper, message, passItOn, "Error, name doesn't include the username or message doesn't have a name", false)
    }
}