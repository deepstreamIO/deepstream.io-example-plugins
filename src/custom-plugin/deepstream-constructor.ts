import { Deepstream } from '@deepstream/server'

export const deepstream = new Deepstream({
    plugins: {
        custom: {
            path: './custom-plugin/custom-plugin',
            options: {
                requiredProperty: 'exists'
            }
        }
    }
})

deepstream.start()
