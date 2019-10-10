import { DeepstreamPlugin, DeepstreamServices, StorageWriteCallback, StorageReadCallback, DeepstreamCache, StorageHeadCallback, StorageHeadBulkCallback } from '@deepstream/types'
import Cache from  "node-cache"

interface NodeCacheOptions {
}

export default class NodeCache extends DeepstreamPlugin implements DeepstreamCache {
    public description = 'Node Cache'
    private logger = this.services.logger.getNameSpace('NODE_CACHE')
    private cache = new Cache();


    constructor (private pluginOptions: NodeCacheOptions, private services: DeepstreamServices) {
        super()
    }

    /**
     * Method to get a records head. The cache is what is hit on every cross reference in permission, read, head, reconnect, pretty
     * much anything record related. As such this should be as lightweight as possible!
     */
    public head(recordName: string, callback: StorageHeadCallback): void {
        this.cache.get(recordName, (err, value: any) => {
            if(err) {
              callback(err.toString())
              return
            }
            callback(null, value)
        })
    }
    
    /**
     * Method to get a records heads in bulk. This is used on login when attempting to check all your record versions locally on 
     * a client to the ones on the server. You can take advantage of multipe get API's (like mget here) to retrieve them all in 
     * one go making this much quicker!
     */
    public headBulk(recordNames: string[], callback: StorageHeadBulkCallback): void {
        this.cache.mget(recordNames, (err, value: any) => {
            if (err) {
              callback(err.toString())
              return
            }
            callback(null, value)
        })
    }

    /**
     * Setting data with the cache is a little more complicated than storage, as we recommend to split the data
     * into two seperate entries, the version and data. This will allow us to minimize the amount of data and computation required
     * when getting the record heads at the expense of a slightly slower set. 
     */
    public set(recordName: string, version: number, data: any, callback: StorageWriteCallback): void {
        this.cache.set(recordName, version)
        this.cache.set(`${recordName}_d`, data, callback)
    }

     /**
     * Getting data with the cache is a little more complicated than storage, as you need to retrieve to records.
     * However given the callback required the version and data seperately this is usually quite easy to implement
     * with most modern cache interfaces.
     */
    public get(recordName: string, callback: StorageReadCallback, metaData?: any): void {
        this.cache.mget( [recordName, `${recordName}_d` ], (err, value: any) => {
            if( err ){
              callback(err.toString())
              return
            }

            callback(null, value[recordName], value[`${recordName}_d`])
        });
    }

    /**
     * Delete a single record. This needs to delete both the version and data entry
     */
    public delete(recordName: string, callback: StorageWriteCallback, metaData?: any): void {
        this.cache.del([recordName, `${recordName}_d` ], callback);
    }

    /**
     * Delete multiple records. This needs to delete both the version and data entries for each record
     */
    public deleteBulk(recordNames: string[], callback: StorageWriteCallback, metaData?: any): void {
        const dataNames = recordNames.map(name => `${name}_d`)
        this.cache.del([...dataNames, ...recordNames], callback);
    }
}