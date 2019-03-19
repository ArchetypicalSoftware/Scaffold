import { IApplicationLifetime, IEventToken } from "../abstractions";
import { EventTokenSource } from "../service-collection/event-token-source";

export class ApplicationLifetime implements IApplicationLifetime {
    public activateEventSource: EventTokenSource;
    public installEventSource: EventTokenSource;

    public activating: IEventToken;
    public installing: IEventToken;

    constructor() {
        this.activateEventSource = new EventTokenSource();
        this.installEventSource = new EventTokenSource();

        this.activating = this.activateEventSource.token;
        this.installing = this.installEventSource.token;
    }
}