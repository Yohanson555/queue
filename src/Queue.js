import _ from 'lodash';

class Queue {
    constructor(dataProvider) {
        if(!dataProvider) {
            throw new Error('Queue dataProvider should specified');
        }

        this.db = dataProvider;
        this.workers = {};
        this.status = {};
        this.progress = {};
        this.cache = {};

        this.db.init();
    }

    addWorker(name, func) {
        this.workers[name] = func;
    }

    async addJob(type, data) {
        return this.db.addRecord(type, data)
            .then(() => {
                this.notify();
            });
    }

    async getAllRecords() {
        return this.db.getRecordsFrom(0);
    }

    async start() {
        const progress = await this.db.getAllProgress();
        const max = await this.db.getMaximumRecordsPosition() || 0;
        console.log(max);
        Object.keys(this.workers).map((worker) => {
            this.status[worker] = false;
            this.progress[worker] = progress[worker] || max;
            this.startWorker(worker);
        });
    }

    notify() {
        for (var worker in this.status) {
            if(!this.status[worker]) {
                this.startWorker(worker);
            }
        }
    }

    startWorker(workerName) {
        if (!this.status[workerName]) {
            this.status[workerName] = true;

            this.whiler(this.exec.bind({worker: workerName, that: this})).then(() => {
                this.status[workerName] = false;
            });
        }
    }

    async whiler(func) {
        while (await func()) {}
    }

    async exec() {
        const { worker, that } = this;
        
        var service = that.workers[worker];

        if (service) {
            return new Promise(async (resolve) => {
                const position = that.progress[worker] || that.db.getMaximumRecordsPosition();
                const record = await that.getJob(position);
               
                if (record) {
                    return service(record)
                        .then((res) => {
                            let p = position + 1;
                            that.progress[worker] = p;
                            that.db.setProgress(worker, p);

                            if (!res) {
                                setTimeout(() => {
                                    console.log('Worker finished with false result. Re-processing in 3 seconds');
                                }, 3000);
                            } else {
                                resolve(true);
                            }
                        }).catch((e) => {
                            setTimeout(() => {
                                console.log(`Exception occured while processing worker: ${e}. Re-processing in 10 seconds`)
                            }, 10000)
                        });
                }
                
                resolve(false);
            }).catch((e) => {
                throw new Error(`Error while queue worker exec: ${e}`);
            });
        }

        return false;
    }

    async getJob(position) {
        if (this.cache[position]) {
            return this.cache[position];
        }

        const record = await this.db.getRecord(position);
        
        if (record) {
            this.cache[position] = record;
        }

        return record;
    }

    async chargeWorker(worker = null, position_from = 0, position_to = null) {
        
        if (worker && typeof worker === 'function') {
            const records = await this.db.getRecordsFromTo(position_from, position_to);
            var position = position_from;

            while (records[position] && await worker(records[position])) {
                position++;
            }
        }

        return false;
    }
}

export default Queue;