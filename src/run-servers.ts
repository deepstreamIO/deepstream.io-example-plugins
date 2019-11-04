import fs from 'fs'

async function program () {
    const files = fs.readdirSync('.')
    const plugins = files.filter(fileName => fs.lstatSync(fileName).isDirectory()).filter(plugin => plugin !== 'cluster-node' && plugin !== 'logger')
    
    for (const plugin of plugins) {
        console.log(`Running ${plugin}`)
        const { deepstream } = await import(`./${plugin}/deepstream-constructor`)
        const startUpPromise = new Promise(resolve => deepstream.on('started', resolve))
        const shutdownPromise = new Promise(resolve => deepstream.on('stopped', resolve))
        await startUpPromise
        deepstream.stop()
        await shutdownPromise
    }

    process.exit(0)
}

program()