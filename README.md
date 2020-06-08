# cache-node

A simple wrapper around any key/value store (memory object by default) that provides provisions to refresh data _before_ it becomes stale.

## Installing

`npm install easyatworkas/cache-node`

## Example

```JavaScript
const Cache = require('@easyatwork/cache');

let cache = new Cache();

// Stale after 60 seconds. Expires after 3600 seconds.
let item = cache.get('foo', () => 'bar', 60, 3600);

// "bar"
console.log(item.value);
```

Stale items are returned from the cache immediately, just like any other non-expired item, but the provided closure will be executed once the event loop becomes free to refresh the stored value.

## License
[MIT](https://choosealicense.com/licenses/mit/)
