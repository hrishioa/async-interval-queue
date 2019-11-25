const AsyncQueue = require('./async-interval-queue');

// Create a new queue with running interval in ms
let myQueue = new AsyncQueue(1000);

async function myFunc(value) {
  return value;
}

// Schedule a job with a thunk
myQueue.add(() => Promise.resolve("Hello"), true).then(console.log);
myQueue.add(() => Promise.resolve("World"), true).then(console.log);

// Or, use a decorator
let myQueuedFunc = myQueue.decorator(myFunc, true);

myQueuedFunc("from").then(console.log);
myQueuedFunc("Decorators!").then(console.log);

myQueue.start();