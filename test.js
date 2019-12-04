const AsyncQueue = require('./async-interval-queue');

// Create a new queue with running interval in ms
let myQueue = new AsyncQueue(1000);

async function myFunc(value) {
  return value;
}

async function standard() {
  // Schedule a job with a thunk
  myQueue.add(() => Promise.resolve("Hello"), true).then(console.log);
  myQueue.add(() => Promise.resolve("World"), true).then(console.log);

  // Or, use a decorator
  let myQueuedFunc = myQueue.decorator(myFunc, true);

  myQueuedFunc("from").then(console.log);
  let promise1 = myQueuedFunc("Decorators!").then(console.log);

  myQueue.start();

  await promise1;
  return true;
}

async function requeue() {
  let successes = [];

  function probabilisticFail(value, pSuccess) {
    return new Promise((resolve, reject) => {
      if(Math.random() < pSuccess) {
        successes.push(value);
        resolve(value+" succeeded");
      } else
        reject(value+" Rejected due to probability");
    })
  }

  let myQueue2 = new AsyncQueue(1000);

  let pFunc = myQueue2.decorator(probabilisticFail, false, 2);
  let pSuccess = 0.5;

  let queuePromises = [
    pFunc("one",pSuccess)
        .then(val => {console.log("one succeeded with ",val); return Promise.resolve(val)})
        .catch(val => {console.log("one failed with ",val); return Promise.resolve(val)}),
    pFunc("two",pSuccess)
        .then(val => {console.log("two succeeded with ",val); return Promise.resolve(val)})
        .catch(val => {console.log("two failed with ",val); return Promise.resolve(val)}),
    pFunc("three",pSuccess)
        .then(val => {console.log("three succeeded with ",val); return Promise.resolve(val)})
        .catch(val => {console.log("three failed with ",val); return Promise.resolve(val)}),
    pFunc("four",pSuccess)
        .then(val => {console.log("four succeeded with ",val); return Promise.resolve(val)})
        .catch(val => {console.log("four failed with ",val); return Promise.resolve(val)}),
    pFunc("five",pSuccess)
        .then(val => {console.log("five succeeded with ",val); return Promise.resolve(val)})
        .catch(val => {console.log("five failed with ",val); return Promise.resolve(val)}),
    pFunc("six",pSuccess)
        .then(val => {console.log("six succeeded with ",val); return Promise.resolve(val)})
        .catch(val => {console.log("six failed with ",val); return Promise.resolve(val)}),
  ]

  console.log("All done - ", await Promise.all(queuePromises));

  console.log("Order - ",successes);

  return true;
}

standard().then(requeue).then(() => console.log("Completed tests"));
