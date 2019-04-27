import { ILogger, LogLevel } from "../abstractions";

// tslint:disable-next-line:no-empty
const noop = () => {};

export class DefaultLogger implements ILogger {
    public logLevel: LogLevel = LogLevel.Info;

    constructor() {
        // tslint:disable-next-line:no-console
        console.log = console.log || noop;
        // tslint:disable-next-line:no-console
        console.info = console.info || noop;
        // tslint:disable-next-line:no-console
        console.warn = console.warn || noop;
        // tslint:disable-next-line:no-console
        console.error = console.error || noop;        
        // tslint:disable-next-line:no-console
        console.group = console.group || noop;
        // tslint:disable-next-line:no-console
        console.groupCollapsed = console.groupCollapsed || noop;
        // tslint:disable-next-line:no-console
        console.groupEnd = console.groupEnd || noop;
    }

    public get isDebug(): boolean {
        return this.logLevel <= LogLevel.Debug;
    }

    public get isInfo(): boolean {
        return this.logLevel <= LogLevel.Info;
    }

    public get isWarn(): boolean {
        return this.logLevel <= LogLevel.Warn;
    }

    public debug(message: string): void {
        if (this.isDebug) {            
            // tslint:disable-next-line:no-console
            console.log(message);
        }
    }

    public info(message: string): void {
        if (this.isInfo) {            
            // tslint:disable-next-line:no-console
            console.info(message);
        }
    }

    public warn(message: string): void {
        if (this.isWarn) {
            // tslint:disable-next-line:no-console
            console.warn(message);
        }
    }

    public error(message: string): void {
        // tslint:disable-next-line:no-console
        console.error(message);
    }

    public group(title: string, message: string = "", logLevel: LogLevel = LogLevel.Debug): void {
        const style = this.getGroupStyle(logLevel);

        if (!message) {
            // tslint:disable-next-line:no-console
            console.group(`%c ${title} `, style);
        } else {
            // tslint:disable-next-line:no-console
            console.group(`%c ${title} %c ${message}`, style, "");
        }
    }

    public groupCollapsed(title: string, message: string = "", logLevel: LogLevel = LogLevel.Debug): void {
        const style = this.getGroupStyle(logLevel);

        if (!message) {
            // tslint:disable-next-line:no-console
            console.groupCollapsed(`%c ${title} `, style);
        } else {
            // tslint:disable-next-line:no-console
            console.groupCollapsed(`%c ${title} %c ${message}`, style, "");
        }
    }

    public groupEnd(): void {
        // tslint:disable-next-line:no-console
        console.groupEnd();
    }

    private getGroupStyle(logLevel: LogLevel): string {
        let style = "border-radius:2px;";

        switch (logLevel) {
            case LogLevel.Debug:
                break;
            case LogLevel.Info:
                style += "background-color:#0077FF;";
                break;
            case LogLevel.Warn:
                style += "background-color:#FFA200;";
                break;
            case LogLevel.Error:
                style += "background-color:#FF2200;";
        }

        return style;
    }
}
