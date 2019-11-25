module.exports = class AsyncQueue {
  constructor(intervalMs) {
    this.queue = [];
    this.index = 0;
    this.running = false;
    this.intervalMs = intervalMs;
  }

  add(asyncFunction, doNotStart) {
    return new Promise((resolve, reject) => {
      this.queue.push(() => {
        asyncFunction().then(value => resolve(value)).catch(err => reject(err));
      });
      if(!doNotStart && !this.interval)
        this.start();
    })
  }

  decorator(asyncFunction, doNotStart) {
    let queue = this;
    return function () {
      return queue.add(() => asyncFunction.apply(this, arguments), doNotStart);
    }
  }

  runNext() {
    var thisQueue = this;
    return () => {
      if(thisQueue.index < thisQueue.queue.length) {
        thisQueue.index++;
        if(thisQueue.index >= thisQueue.queue.length)
          thisQueue.stop();
        thisQueue.queue[thisQueue.index-1]();
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