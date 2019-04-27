import { ServiceCollection } from "./service-collection";

declare module "./../abstractions" {
    interface IServiceCollection {
        /**
         * Defines a configuration object available to middleware.
         *
         * @template T Configuration object type
         * @param {string} optionsName Name of configuration object type
         * @param {T} options Instance of configuration object
         * @memberof IServiceCollection
         */
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
