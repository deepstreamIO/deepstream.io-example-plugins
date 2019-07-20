import { DeepstreamPlugin, DeepstreamServices, DeepstreamStorage, StorageWriteCallback, StorageReadCallback } from '@deepstream/types'
import * as fs from 'fs'

interface FileStorageOptions {
    directory: string
}

export default class FileStorage extends DeepstreamPlugin implements DeepstreamStorage {
    public description: 'File Storage'
    private logger = this.services.logger.getNameSpace('FILE_STORAGE')

    constructor (private pluginOptions: FileStorageOptions, private services: DeepstreamServices) {
        super()
    }

    public init () {
        if (typeof this.pluginOptions.directory !== 'string') {
            this.logger.fatal('Missing or invalid directory option')
        }
        const exists = fs.existsSync(this.pluginOptions.directory)
        if (!exists) {
            this.logger.fatal(`Missing directory ${this.pluginOptions.directory}`)
        }
    }

    public set(recordName: string, version: number, data: any, callback: StorageWriteCallback, metaData?: any): void {
        fs.writeFile(`${this.pluginOptions.directory}/${recordName}`, JSON.stringify({ v: version, d: data }), (err) => {
            if (err) {
                callback(err.toString())
            } else {
                callback(null)
            }
        })
    }
    public get(recordName: string, callback: StorageReadCallback, metaData?: any): void {
        fs.readFile(`${this.pluginOptions.directory}/${recordName}`, (err, content) => {
            if (err) {
                callback(null, -1, null)
                return
            }
            const value = JSON.parse(content.toString())
            callback(null, value.v, value.d)
        })
    }
    public delete(recordName: string, callback: StorageWriteCallback, metaData?: any): void {
        fs.unlink(`${this.pluginOptions.directory}/${recordName}`, (err) => {
            if (err) {
                callback(err.toString())
            } else {
                callback(null)
            }
        })
    }

    public deleteBulk(recordNames: string[], callback: StorageWriteCallback, metaData?: any): void {
        let count = 0
        const cb = () => {
            count++
            if (count === recordNames.length) {
                callback(null)
            }
        }
        recordNames.forEach(name => this.delete(name, cb))
    }
}