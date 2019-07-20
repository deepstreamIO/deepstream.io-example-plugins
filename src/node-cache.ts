import { DeepstreamPlugin, DeepstreamServices, StorageWriteCallback, StorageReadCallback, DeepstreamCache, StorageHeadCallback, StorageHeadBulkCallback } from '@deepstream/types'
import Cache from  "node-cache"

interface NodeCacheOptions {
}

export default class NodeCache extends DeepstreamPlugin implements DeepstreamCache {
    public description: 'Node Cache'
    private logger = this.services.logger.getNameSpace('NODE_CACHE')
    private cache = new Cache();


    constructor (private pluginOptions: NodeCacheOptions, private services: DeepstreamServices) {
        super()
    }

    public head(recordName: string, callback: StorageHeadCallback): void {
        this.cache.get(recordName, (err, value: any) => {
            if(err) {
              callback(err.toString())
              return
            }
            callback(null, value)
        })
    }
    
    public headBulk(recordNames: string[], callback: StorageHeadBulkCallback): void {
        this.cache.mget(recordNames, (err, value: any) => {
            if (err) {
              callback(err.toString())
              return
            }
            callback(null, value)
        })
    }

    public set(recordName: string, version: number, data: any, callback: StorageWriteCallback, metaData?: any): void {
        this.cache.set(recordName, version)
        this.cache.set(`${recordName}_d`, data, callback)
    }

    public get(recordName: string, callback: StorageReadCallback, metaData?: any): void {
        this.cache.mget( [recordName, `${recordName}_d` ], (err, value: any) => {
            if( err ){
              callback(err.toString())
              return
            }

            callback(null, value[recordName], value[`${recordName}_d`])
        });
    }

    public delete(recordName: string, callback: StorageWriteCallback, metaData?: any): void {
        this.cache.del([recordName, `${recordName}_d` ], callback);
    }

    public deleteBulk(recordNames: string[], callback: StorageWriteCallback, metaData?: any): void {
        const dataNames = recordNames.map(name => `${name}_d`)
        this.cache.del([...dataNames, ...recordNames], callback);
    }
}