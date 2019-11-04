import { Deepstream } from '@deepstream/server'
import UsernamePermission from './username-permission'

const deepstream = new Deepstream({})

deepstream.set('permission', new UsernamePermission({}, deepstream.getServices()))

deepstream.start()
