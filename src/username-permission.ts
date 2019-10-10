import { DeepstreamPlugin, DeepstreamServices, DeepstreamPermission, PermissionCallback, SocketWrapper } from '@deepstream/types'
import { Message } from '@deepstream/protobuf/dist/types/messages';
import { JSONObject } from '@deepstream/protobuf/dist/types/all';

interface UsernamePermissionOptions {
}

export default class UsernamePermission extends DeepstreamPlugin implements DeepstreamPermission {
    public description = 'Header Authentication';
    private logger = this.services.logger.getNameSpace('USERNAME_PERMISSION')

    constructor (private pluginOptions: UsernamePermissionOptions, private services: DeepstreamServices) {
        super()
    }

    /**
     * The permission API is more functional due to the performance implications in deepstream, hence we path through alot of the data! This 
     * also allows you to go a bit crazy with implementations.
     * 
     * Whats important is you return an error or valid callback per permission, and keep in mind event though it is async you really want this
     * to be as quick and lightweight as possible!
     * 
     * You have full access to the message via the `message` object and `authData` which is the `serverData` returned via the authentication plugin.
     */
    canPerformAction(socketWrapper: SocketWrapper, message: Message, callback: PermissionCallback, passItOn: any): void {
        // In this example just check that there is a name to the message and it contains the username. This is a very naive example as it means the user
        // can't invoke RPCs and scopes all realtime interaction to just one client. However if you used `authData.orgName` this would allow you to do multi-tenancy
        // permissions!
        if (message.name && message.name.includes(socketWrapper.userId)) {
            callback(socketWrapper, message, passItOn, null, true)
            return
        }

        callback(socketWrapper, message, passItOn, "Error, name doesn't include the username or message doesn't have a name", false)
    }
}