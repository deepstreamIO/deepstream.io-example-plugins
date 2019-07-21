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
    private logger = pino()

    constructor (private pluginOptions: PinoLoggerOptions, private services: DeepstreamServices) {
        super()
    }

    /**
     * Return true if logging is enabled. This is used in deepstream to stop generating useless complex strings
     * that we know will never be logged.
     */
    public shouldLog(logLevel: LOG_LEVEL): boolean {
        return this.logger.islevelenabled(DSToPino[logLevel])
    }

    /**
     * Set the log level desired by deepstream. Since deepstream uses LOG_LEVEL this needs to be mapped
     * to whatever your libary uses (this is usually just conversion stored in a static map)
     */
    public setLogLevel(logLevel: LOG_LEVEL): void {
        this.logger.level = DSToPino[logLevel]
    }
    
    /**
     * Log as info
     */
    public info(event: string, message?: string, metaData?: any): void {
        this.logger.info(`${event}, ${message}`)
    }

    /**
     * Log as debug
     */
    public debug(event: string, message?: string, metaData?: any): void {
        this.logger.debug(`${event}, ${message}`)
    }

    /**
     * Log as warn
     */
    public warn(event: string, message?: string, metaData?: any): void {
        this.logger.warn(`${event}, ${message}`)
    }

    /**
     * Log as error
     */
    public error(event: string, message?: string, metaData?: any): void {
        this.logger.error(`${event}, ${message}`)
    }

    /**
     * Log as error
     */
    public fatal(event: string, message?: string, metaData?: any): void {
        this.logger.fatal(`${event}, ${message}`)
        this.services.notifyFatalException()
    }

    /**
     * Create a namespaced logger, used by plugins. This could either be a new instance of a logger
     * or just a thin wrapper to add the namespace at the beginning of the log method.
     */
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