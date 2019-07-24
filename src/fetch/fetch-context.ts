import { IFetchContext, IFetchEvent, ILogEntry, IRequest, IResponse, IServiceProvider, LogLevel } from "../abstractions";
import { LogEntry } from "./log-entry";

export class FetchContext implements IFetchContext {
    public request: IRequest;
    public response: Promise<IResponse>;
    public event: IFetchEvent;
    public services: IServiceProvider;
    public logEntries: ILogEntry[];

    constructor(fetchEvent: IFetchEvent, services?: IServiceProvider) {
        this.request = fetchEvent.request;
        this.response = null as unknown as Promise<IResponse>;
        this.event = fetchEvent;
        this.services = services as IServiceProvider;
        this.logEntries = [];
    }

    public log(logLevel: LogLevel, message: string): void {
        this.logEntries.push(new LogEntry(logLevel, message));
    }
}
