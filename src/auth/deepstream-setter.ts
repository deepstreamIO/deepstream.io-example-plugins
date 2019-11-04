import TokenAuthentication from './token-authentication'
import { Deepstream } from '@deepstream/server'

const deepstream = new Deepstream({})

deepstream.set('auth', new TokenAuthentication({}, deepstream.getServices()))

deepstream.start()
