import { DeepstreamPlugin, DeepstreamServices, DeepstreamAuthentication, DeepstreamAuthenticationResult, EVENT } from '@deepstream/types'
import { TokenContent } from "keycloak-connect";
import Keycloak = require('keycloak-connect');
import { Request, Response } from 'express';

interface OpenidAuthenticationOptions {
    keycloakRealm: string;
    keycloakBaseUrl: string;
}

interface ExtentedTokenContent extends TokenContent {
    scope: string;
    email_verified: boolean;
    name: string;
    preferred_username: string;
    given_name: string;
    family_name: string;
    email: string;
}

/**
 * auth plugin for deepstream, that uses a regular access token to decide about authentication
 */
export default class OpenidAuthentication extends DeepstreamPlugin implements DeepstreamAuthentication {
    public description = 'Openid Authentication'
    private logger = this.services.logger.getNameSpace('OPENID AUTH')

    private keycloak: Keycloak;

    constructor(private options: OpenidAuthenticationOptions, private services: Readonly<DeepstreamServices>) {
        super()
        this.keycloak = new Keycloak(
            {},
            {
                realm: options.keycloakRealm,
                "bearer-only": true,
                "auth-server-url": options.keycloakBaseUrl,
                "ssl-required": "external",
                resource: "deepstream",
                "confidential-port": 0,
            }
        );
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
     * serverData is data that can be accessed throughout deepstream (mostly via permissioning and custom plugins) incase
     * you want more context about the actual client
     * 
     * clientData is returned to the client after a succesful login. This could be a token to allow them to login again
     * without entering sensitive information or their favourite color preferences. However, it's worth noting that it's
     * always recommended to use records because they are dynamic! ClientData should usually be login related, like session
     * expiry time or such.
     */

    async isValidUser(connectionData: any, authData: any): Promise<DeepstreamAuthenticationResult | null> {
        this.logger.info(`isValidUser connectionData=${JSON.stringify(connectionData)}`);

        if (typeof authData.token !== 'string') {
            this.logger.warn(EVENT.AUTH_ERROR, "authData must contain token as string");
            return null
        }
        // in order to validate  the token with keycloak, we create a fake request / response to use the
        // regular keycloak lib creating a grant
        let responseCode = 0;
        const fakeReq = { headers: { authorization: authData.token, } };
        const fakeRes = { status: (code: number) => { responseCode = code; }, end: () => { } };

        let grant: Keycloak.Grant | null = null;
        try {
            grant = await this.keycloak.getGrant(fakeReq as Request, fakeRes as Response);
        } catch (e) {
            this.logger.warn(EVENT.AUTH_ERROR, "could not get grant from token: " + JSON.stringify(e));
        }
        if (grant && responseCode === 0) {
            // if token is valid, we use the token content as userId
            // and put to whole token into server data for creating permissions based on token later
            const extToken = grant.access_token.content as ExtentedTokenContent;
            this.logger.info(EVENT.INFO, "login sucessful, token valid");
            return {
                isValid: true,
                id: extToken.preferred_username,
                serverData: { grant: JSON.stringify(grant) },
                clientData: undefined,
            };
        }

        // If an invalid token is provided then return null incase another auth
        // handler can save the day
        return null
    }
}