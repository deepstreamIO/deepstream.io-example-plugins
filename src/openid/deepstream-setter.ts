import OpenidAuthentication from './openid-authentication'
import { Deepstream } from '@deepstream/server'

const deepstream = new Deepstream({})

deepstream.set('auth', new OpenidAuthentication({ keycloakBaseUrl: "", keycloakRealm: "" }, deepstream.getServices()))

deepstream.start()
