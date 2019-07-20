import { DeepstreamPlugin, DeepstreamServices, UserAuthenticationCallback, DeepstreamAuthentication, DeepstreamLogger, LOG_LEVEL, NamespacedLogger, EVENT } from '@deepstream/types'
import * as pino from 'pino'

interface PinoLoggerOptions {
}

const DSToPino = {
    [LOG_LEVEL.DEBUG]: 'debug',
    [LOG_LEVEL.FATAL]: 'fatal',
    [LOG_LEVEL.ERROR]: 'error',
    [LOG_LEVEL.WARN]: 'warn',
    [LOG_LEVEL.INFO]: 'info',
}

export default class PinoLogger extends DeepstreamPlugin implements DeepstreamLogger {
    public description: 'Pino Logger';
    private logLevel = LOG_LEVEL.INFO
    private logger = pino()

    constructor (private pluginOptions: PinoLoggerOptions, private services: DeepstreamServices) {
        super()
    }

    public shouldLog(logLevel: LOG_LEVEL): boolean {
        return this.logger.islevelenabled(DSToPino[logLevel])
    }

    public setLogLevel(logLevel: LOG_LEVEL): void {
        this.logger.level = DSToPino[logLevel]
    }
    
    public info(event: string, message?: string, metaData?: any): void {
        this.logger.info(`${event}, ${message}`)
    }
    public debug(event: string, message?: string, metaData?: any): void {
        this.logger.debug(`${event}, ${message}`)
    }
    public warn(event: string, message?: string, metaData?: any): void {
        this.logger.warn(`${event}, ${message}`)
    }
    public error(event: string, message?: string, metaData?: any): void {
        this.logger.error(`${event}, ${message}`)
    }
    public fatal(event: string, message?: string, metaData?: any): void {
        this.logger.fatal(`${event}, ${message}`)
        this.services.notifyFatalException()
    }

    public getNameSpace (namespace: string): NamespacedLogger {
        return {
          shouldLog: this.shouldLog.bind(this),
          fatal: this.log.bind(this, 'fatal', namespace),
          error: this.log.bind(this, 'error', namespace),
          warn: this.log.bind(this, 'warn', namespace),
          info: this.log.bind(this, 'info', namespace),
          debug: this.log.bind(this, 'debug', namespace),
        }
      }

    private log (logLevel: LOG_LEVEL, namespace: string, event: EVENT, logMessage: string) {
        this.logger[logLevel](`${namespace} ${event} ${logMessage}`)
    }
}