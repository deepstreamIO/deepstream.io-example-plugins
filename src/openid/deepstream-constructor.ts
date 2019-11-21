import { Deepstream } from '@deepstream/server'

export const deepstream = new Deepstream({
    auth: [{
        path: './openid/openid-authentication',
        options: {
            keycloakBaseUrl: "",
            keycloakRealm: ""
        }
    }]
})

deepstream.start()
