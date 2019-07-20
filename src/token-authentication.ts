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