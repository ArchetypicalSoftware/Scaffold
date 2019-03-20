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

            const promises: Array<Promise<void>> = [];

            this.handlers.forEach((handler) => {
                try {
                    promises.push(handler());
                } catch (err) {
                    if (logger) {
                        logger.error(err);
                    }
                }
            });

            // Wait for all the promises even if there are rejections
            await Promise.all(promises.map(async (promise) => {
                try {
                    return promise;
                } catch (e) {
                    if (logger) {
                        logger.error(e);
                    }
                }
            }));
        }
    }
}