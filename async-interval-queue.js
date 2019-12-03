module.exports = class AsyncQueue {
  constructor(intervalMs) {
    this.queue = [];
    this.index = 0;
    this.running = false;
    this.intervalMs = intervalMs;
  }

  add(asyncFunction, doNotStart, requeueOnFail, retries) {
    let thisQueue = this;
    return new Promise((resolve, reject) => {
      let job = {
        task: () => {
          asyncFunction().then(value => resolve(value)).catch(err => reject(err));
        }
      };

      if(requeueOnFail && retries !== 0) {
        if(!retries)
          retries = 1;

        job = {
          task: () => {
            asyncFunction().then(value => resolve(value)).catch(err => {
              return thisQueue.add(asyncFunction, doNotStart, requeueOnFail, retries-1).then(val => resolve(val)).catch(err => reject(err));
            });
          }
        }
      }

      this.queue.push(job);
      if(!doNotStart && !this.interval)
        this.start();
    })
  }

  decorator(asyncFunction, doNotStart, requeueOnFail, retries) {
    let thisQueue = this;
    return function () {
      return thisQueue.add(() => asyncFunction.apply(this, arguments), doNotStart, requeueOnFail, retries);
    }
  }

  runNext() {
    var thisQueue = this;
    return () => {
      if(thisQueue.index < thisQueue.queue.length) {
        thisQueue.index++;
        if(thisQueue.index >= thisQueue.queue.length)
          thisQueue.stop();
        thisQueue.queue[thisQueue.index-1].task();
      }
    }
  }

  start() {
    if(this.interval)
      throw Error ("Queue has already started");
    this.interval = setInterval(this.runNext(), this.intervalMs);
  }

  stop() {
    if(this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}