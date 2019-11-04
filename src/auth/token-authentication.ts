import { DeepstreamPlugin, DeepstreamServices, DeepstreamAuthentication, DeepstreamAuthenticationResult } from '@deepstream/types'
import { Dictionary } from 'ts-essentials';

const TOKENS: Dictionary<DeepstreamAuthenticationResult> = {
    'ABC': {
        isValid: true,
        id: 'John',
        serverData: { admin: true },
        clientData: { theme: 'red' }
    },
    '123': {
        isValid: true,
        id: 'Bob',
        serverData: { admin: false },
        clientData: { theme: 'blue' }
    }
}
interface TokenAuthenticationOptions {
}

export default class TokenAuthentication extends DeepstreamPlugin implements DeepstreamAuthentication {
    public description = 'Token Authentication'
    private logger = this.services.logger.getNameSpace('HEADER_AUTHENTICATION')

    constructor (private pluginOptions: TokenAuthenticationOptions, private services: Readonly<DeepstreamServices>) {
        super()
    }

    /**
     * The only API callback required for authentication.
     * 
     * The callback signature is as follows:
     * 
     * If user is found:
     * 
     * return {
     *  isValid: boolean,
     *  id: uuid,
     *  clientData: {}, // data to send to client on login or login error
     *  serverData: {} // data used to authenticate users
     * }
     * 
     * // If user is not found, return null
     * return null
     * 
     * The username is the name to be used by permissions as well as presence. It doesn't have to be unique, but
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
    async isValidUser(connectionData: any, authData: any) {
        if (typeof authData.token !== 'string') {
            return null
        }

        if (TOKENS[authData.token]) {
            return TOKENS[authData.token]
        }

        // If an invalid token is provided then return null incase another auth
        // handler can save the day
        return null
    }
}