import { LogLevel } from "../abstractions";

export class LogEntry {
    public logLevel: LogLevel;
    public message: string;

    constructor(logLevel: LogLevel, message: string) {
        this.logLevel = logLevel;
        this.message = message;
    }
}
