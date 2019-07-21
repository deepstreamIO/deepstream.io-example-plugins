import { DeepstreamPlugin, DeepstreamServices, UserAuthenticationCallback, DeepstreamAuthentication } from '@deepstream/types'

const TOKENS = {
    'ABC': {
        username: 'John',
        serverData: { admin: true },
        clientData: { theme: 'red' }
    },
    '123': {
        username: 'Bob',
        serverData: { admin: false },
        clientData: { theme: 'blue' }
    }
}
interface TokenAuthenticationOptions {
}

export default class TokenAuthentication extends DeepstreamPlugin implements DeepstreamAuthentication {
    public description: 'Token Authentication';
    private logger = this.services.logger.getNameSpace('HEADER_AUTHENTICATION')

    constructor (private pluginOptions: TokenAuthenticationOptions, private services: DeepstreamServices) {
        super()
    }

    /**
     * The only API callback required for authentication.
     * 
     * The callback signature is as follows:
     * 
     * ```
     * callback(isValid, {
     *   username: 'Bob',
     *   serverData: {},
     *   clientData: {}
     * })
     * ```
     * 
     * The username is the name to be used by permissioning as well as presence. It doesn't have to be unique, but
     * if more than one user with the same name is logged in the system doesn't behave any differently! So if you want
     * each user to be unique you may need to add a uuid to distinguish between them.
     * 
     * serverData is data is can be accessed throughout deepstream (mostly via permissioning and custom plugins) incase
     * you want more context about the actual client
     * 
     * clientData is returned to the client after a succesful login. This could be a token to allow them to login again
     * without entering sensitive information or their favourite color preferences. However, it's worth noting that it's
     * always recommended to use records because they are dynamic! ClientData should usually be login related, like session
     * expiry time or such.
     */
    isValidUser(connectionData: any, authData: any, callback: UserAuthenticationCallback): void {
        if (typeof authData.token !== 'string') {
            callback(false, {
                clientData: { error: 'Missing token' }
            })
            return
        }

        if (TOKENS[authData.token]) {
            callback(true, TOKENS[authData.token])
            return
        }

        callback(false, {
            clientData: { error: 'Invalid Token' }
        })
    }
}