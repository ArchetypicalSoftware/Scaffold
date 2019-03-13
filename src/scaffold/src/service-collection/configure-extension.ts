import { ServiceCollection } from "./service-collection";

declare module "./../abstractions" {
    interface IServiceCollection {
        configure<T extends object>(optionsName: string, options: T): void;
    }
}

declare module "./service-collection" {
    // tslint:disable-next-line:interface-name
    interface ServiceCollection {
        configure<T extends object>(optionsName: string, options: T): void;
    }
}

ServiceCollection.prototype.configure = function<T extends object>(optionsName: string, options: T) {
    this.addSingleton(optionsName, () => options);
};
