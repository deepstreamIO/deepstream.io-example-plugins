import { DeepstreamLockRegistry, DeepstreamPlugin, DeepstreamServices, LockCallback } from "@deepstream/types";
import { Redis } from 'ioredis'

interface RedisLocksOptions {
    host: string,
    port: number
}

export default class RedisLocks extends DeepstreamPlugin implements DeepstreamLockRegistry {
    description: 'Redis Locks';
    private logger = this.services.logger.getNameSpace('REDIS_LOCKS')
    client: any;

    constructor(private options: RedisLocksOptions, private services: DeepstreamServices) {
        super();
    }

    public async whenReady(): Promise<void> {
        return new Promise(resolve => {
            this.client = new Redis(this.options);
            this.client.once('ready', () => resolve());
            this.client.on('error', (err) => this.logger.fatal(err.toString()))
            this.client.on('end', () => this.logger.fatal('disconnected'))
        })         
    }

    public async close(): Promise<void> {
        return new Promise((resolve) => {
            this.client.removeAllListeners('end')
            this.client.once('close', resolve);
            this.client.close();
        });
    }

    public get(lock: string, callback: LockCallback): void {
        throw new Error("Method not implemented.");
    }
    
    public release(lock: string): void {
        throw new Error("Method not implemented.");
    }
}