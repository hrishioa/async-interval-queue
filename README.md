# Async Interval Queue [![npm version](https://badge.fury.io/js/async-interval-queue.svg)](https://badge.fury.io/js/async-interval-queue)

A simple, no dependencies queue for scheduling jobs to run on an interval. Built originally to space out API requests and to minimize code changes when used. Simply replace any async call with the add function, and you get a promise that returns the expected value when the job is run.

The queue is also able to requeue a job if it fails, to a variable number of retries specific to the job.

The queue also includes a decorator (not supported in JS yet, so no fancy @ notation) to wrap commonly used functions.

A sharded version of this queue that can support cluster workloads is published on npm as [sharded-interval-queue](https://www.npmjs.com/package/sharded-interval-queue).

## Installation

```bash
npm install async-interval-queue
```

## Usage

### Creating an instance

```javascript
const AsyncQueue = require('async-interval-queue');

// Create a new queue with running interval in ms
let myQueue = new AsyncQueue(1000);

// Let's make an async function for tests
async function myFunc(value) {
  return value;
}
```

### Adding jobs using a thunk

```javascript
myQueue.add(() => Promise.resolve("Hello"), true).then(console.log);
myQueue.add(() => Promise.resolve("World"), true).then(console.log);

myQueue.start();
```

### Wrapping functions with the decorator

```javascript
let myQueuedFunc = myQueue.decorator(myFunc, true);

myQueuedFunc("from").then(console.log);
myQueuedFunc("Decorators!").then(console.log);

myQueue.start();
```

The queue starts by default on a job being added. The second parameter to add can be set to true to prevent this.

The queue will stop when there are no jobs left. You can restart it manually, or add a job without the doNotStart parameter.

### Requeuing and optional parameters

`add` has three optional parameters which can also be passed to the decorator:

* `doNotStart` - if True, the queue is not started when this job is added.
* `retries` - Number of retries. If greater than zero, the job is requeued if it fails, the promise returning the first successful or last run.

For example, to enqueue a job without starting the queue, and 3 retries:

```javascript
// Thunk city
myQueue.add(() => Promise.resolve("Hello"), true, 3);

// Decorator
let myDecorator = myQueue.decorator(myFunc, true, 3);
```

## Contributing

Pull requests are welcome. This queue is being used in production at [Greywing](https://grey-wing.com), so I'd be happy to hear about how we can improve it.

## Future work and improvements

This version of the queue does not support multi-threaded or cluster workloads. Next step is to integrate it with a persistent cache to allow multiple programs to keep their own queues but run synchronized.

## License

[MIT](https://choosealicense.com/licenses/mit/)