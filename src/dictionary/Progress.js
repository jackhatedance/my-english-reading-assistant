class Progress {

    constructor(job, total, updateProgress, sleepWorkRatio = 0.1){
        this.job = job;
        this.i = 0;
        this.lastRateText = '';
        this.total = total;
        this.batchSize = Math.floor(this.total / 1000);
        if(this.batchSize < 1){
            this.batchSize = 1;
        }

        this.updateProgress = updateProgress;
        this.sleepWorkRatio = sleepWorkRatio;
    }

    start(){
        this.startTime = Date.now();
        this.batchStartTime = Date.now();
        
    }

    async count(){
        if (this.i % this.batchSize == 0) {
            let batchWorkTime = Date.now() - this.batchStartTime;
            let batchSleepTime = batchWorkTime * this.sleepWorkRatio; 
            //reduce CPU usage
            await new Promise(resolve => setTimeout(resolve, batchSleepTime));
            this.batchStartTime = Date.now();
        }

        this.i = this.i+1;

        let rate = this.i / this.total;
        let milliSecondsElapsed = Date.now() - this.startTime;
        let milliSecondsRemain = milliSecondsElapsed / rate - milliSecondsElapsed;

        let rateText = (rate * 100).toFixed(1);
        if (rateText !== this.lastRateText) {
            if (this.updateProgress) {
                this.updateProgress({ job: this.job, rate: rate, remain: milliSecondsRemain });
            }

            this.lastRateText = rateText;
        }
    }
}

export { Progress }