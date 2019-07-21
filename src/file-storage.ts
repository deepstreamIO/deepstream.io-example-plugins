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

    /**
     * Method to save a record to storage. Since storage is longer term we usually combined the version and head
     * together into one object. However that is an implementation detail, and some databases have a concept of version 
     * you can share!
     */
    public set(recordName: string, version: number, data: any, callback: StorageWriteCallback): void {
        fs.writeFile(`${this.pluginOptions.directory}/${recordName}`, JSON.stringify({ v: version, d: data }), (err) => {
            if (err) {
                callback(err.toString())
            } else {
                callback(null)
            }
        })
    }

    /**
     * Method to get a record from storage.
     * 
     * If the record doesn't exist you return a version of -1 and data as null
     */
    public get(recordName: string, callback: StorageReadCallback): void {
        fs.readFile(`${this.pluginOptions.directory}/${recordName}`, (err, content) => {
            if (err) {
                callback(null, -1, null)
                return
            }
            const value = JSON.parse(content.toString())
            callback(null, value.v, value.d)
        })
    }

    /**
     * Method to delete a record from storage.
     */
    public delete(recordName: string, callback: StorageWriteCallback): void {
        fs.unlink(`${this.pluginOptions.directory}/${recordName}`, (err) => {
            if (err) {
                callback(err.toString())
            } else {
                callback(null)
            }
        })
    }

    /**
     * Method to delete multiple records at once. This is used to reduce the amount of IO and 
     * callbacks.
     */
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