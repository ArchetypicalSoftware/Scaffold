import { IEventToken, ILogger } from "../abstractions";
import { EventToken } from "./event-token";

export class EventTokenSource {
    public token: IEventToken;

    private handlers: Array<(() => Promise<void>)>;
    private hasFired: boolean;

    constructor() {
        this.handlers = [];
        this.hasFired = false;
        this.token = new EventToken(this.handlers);
    }

    public async fire(logger?: ILogger) {
        if (!this.hasFired) {
            this.hasFired = true;

            await Promise.all(this.handlers.map(async (handler) => {
                try {
                    await handler();
                } catch (e) {
                    if (logger) {
                        logger.error(e);
                    }
                }
            }));
        }
    }
}
