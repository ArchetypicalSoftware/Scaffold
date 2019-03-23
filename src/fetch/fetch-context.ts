import { ILogEntry, IServiceProvider, LogLevel, IFetchContext } from "../abstractions";
import { LogEntry } from "./log-entry";

export class FetchContext implements IFetchContext {
    public request: Request;
    public response: Promise<Response>;
    public event: FetchEvent;
    public serviceProvider: IServiceProvider;
    public logEntries: ILogEntry[];

    constructor(fetchEvent: FetchEvent, serviceProvider?: IServiceProvider) {
        this.request = fetchEvent.request;
        this.response = null as unknown as Promise<Response>;
        this.event = fetchEvent;
        this.serviceProvider = serviceProvider as IServiceProvider;
        this.logEntries = [];
    }

    public log(logLevel: LogLevel, message: string): void {
        this.logEntries.push(new LogEntry(logLevel, message));
    }
}