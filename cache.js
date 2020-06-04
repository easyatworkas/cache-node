'use strict';

class Cache {
    #driver;

    constructor(driver = null) {
        this.#driver = driver || new MemDriver();
    }

    getDriver() {
        return this.#driver;
    }

    async set(key, value, staleAfter = 0, expireAfter = 0) {
        return this.getDriver().set(key, {
            value,
            timestamp: time(),
            staleAfter,
            expireAfter
        });
    }

    async get(key, provider = null, staleAfter = 0, expireAfter = 0) {
        let item = await this.getDriver().get(key);

        if (item === null) {
            return provider ? this.set(key, provider(), staleAfter, expireAfter) : null;
        }

        const now = time();
        const age = now - item.timestamp;

        if (item.expireAfter && age >= item.expireAfter) {
            this.getDriver().del(key);

            return provider ? this.set(key, provider(), staleAfter, expireAfter) : null;
        }

        if (item.staleAfter && age >= item.staleAfter) {
            item.timestamp = now;

            this.getDriver().set(key, item);

            item.stale = true;

            if (provider) {
                setTimeout(() => {
                    this.set(key, provider(), staleAfter, expireAfter);
                });
            }
        }

        return item;
    }

    end() {
        this.getDriver().end();
    }
}

class MemDriver {
    #data = {};
    #interval;

    constructor() {
        this.#interval = setInterval(() => this.prune(), 60000);
    }

    prune() {
        const now = time();

        for (let key in this.#data) {
            const item = this.#data[key];

            if (item.expireAfter && now - item.timestamp >= item.expireAfter) {
                delete this.#data[key];
            }
        }
    }

    async set(key, value) {
        return this.#data[key] = value;
    }

    async get(key) {
        return key in this.#data ? this.#data[key] : null;
    }

    async del(key) {
        return delete this.#data[key];
    }

    end() {
        this.#data = {};

        if (this.#interval) {
            clearInterval(this.#interval);
            this.#interval = null;
        }
    }
}

function time() {
    return Math.floor(new Date() / 1000);
}

module.exports = Cache;
