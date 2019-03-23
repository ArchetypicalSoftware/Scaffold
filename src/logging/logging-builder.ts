import { ILogger, ILoggingBuilder, LogLevel } from "./../abstractions";

export class LoggingBuilder implements ILoggingBuilder {
    public logLevel: LogLevel | null = null;    
    public loggerFactory: (() => ILogger) | null = null;  
}
