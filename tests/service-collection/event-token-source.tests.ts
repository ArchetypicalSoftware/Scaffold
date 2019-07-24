import { ILogger, LogLevel } from "../../src/abstractions";
import { DefaultLogger } from "../../src/logging/default-logger";
import { EventTokenSource } from "../../src/service-collection/event-token-source";

class NoopLogger implements ILogger {
    public errorCalled: boolean = false;

    public logLevel!: LogLevel;    
    public isDebug!: boolean;
    public isInfo!: boolean;
    public isWarn!: boolean;

    public debug(message: string): void {}
    public info(message: string): void {}
    public warn(message: string): void {}
    public error(message: string): void { this.errorCalled = true; }
    public group(title: string, message?: string, logLevel?: LogLevel): void {}
    public groupCollapsed(title: string, message?: string, logLevel?: LogLevel): void {}
    public groupEnd(): void {}
}

describe("EventTokenSource tests", () => {
    let eventTokenSource: EventTokenSource;
    let logger: NoopLogger;
    
    beforeEach(() => {
        eventTokenSource = new EventTokenSource();
        logger = new NoopLogger();
    });

    test("Fires", async (done) => {
        let fired: boolean = false;
        const token = eventTokenSource.token;
        token.register(async () => {
            fired = true;
            await Promise.resolve();
        });

        await eventTokenSource.fire();

        expect(fired).toBe(true);

        done();
    });

    test("Doesn't fire twice", async (done) => {
        let firedCount: number = 0;

        const token = eventTokenSource.token;

        token.register(async () => {
            firedCount++;
            await Promise.resolve();
        });

        await eventTokenSource.fire();
        await eventTokenSource.fire();
        
        expect(firedCount).toBe(1);

        done();
    });

    test("Error called with logger doesn't fail", async (done) => {
        const token = eventTokenSource.token;
        token.register(() => {
            throw new Error("Error");
        });

        await eventTokenSource.fire(logger);

        expect(logger.errorCalled).toBe(true);

        done();
    });

    test("Error without logger doesn't fail", async (done) => {
        const token = eventTokenSource.token;
        let firedCount: number = 0;
        token.register(() => {
            firedCount++;
            throw new Error("Error");
        });

        await eventTokenSource.fire();

        expect(firedCount).toBe(1);

        done();
    });
});
