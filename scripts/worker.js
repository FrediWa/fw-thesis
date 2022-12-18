//https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

if (window.Worker) {
    const myWorker = new Worker('worker.js');
}