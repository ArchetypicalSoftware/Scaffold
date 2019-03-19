import { IEventToken } from "../abstractions";

export class EventToken implements IEventToken {
    private handlers: Array<(event: ExtendableEvent) => Promise<void>>;

    constructor(handlers: Array<(event: ExtendableEvent) => Promise<void>>) {
        this.handlers = handlers;
    }

    public register(handler: (event: ExtendableEvent) => Promise<void>): void {
        this.handlers.push(handler);
    }
}