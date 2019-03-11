import _ from 'lodash';
import QueueDataProvider from './QueueDataProvider';

class QueueDataProviderMock extends QueueDataProvider {
    constructor() {
        super();

        this.records = null;
        this.progress = null;
        this.counter = null;
    }

    async init() {
        return new Promise((resolve) => {
            this.records = {};
            this.progress = {};
            this.counter = 0;
            resolve(true);
        });
    }

    async addRecord(type, data) {
        return new Promise((resolve) => {
            this.records[this.counter] = {
                id: this.counter++,
                type,
                data
            };
            resolve(true);
        });
    }

    async getRecord(id) {
        return new Promise((resolve) => {
            resolve(this.records[id]);
        });
    }

    async getRecordsFrom(id = 0) {
        return new Promise((resolve) => {
            const result = [];

            _.each(this.records, (record, i) => {
                if(i >= id) {
                    result.push(record);
                }
            });

            resolve(result);
        });
    }

    async getRecordsFromTo(from = 0, to = 1000) {
        return new Promise((resolve) => {
            const result = [];

            _.each(this.records, (record, i) => {
                if(i >= from && i <= to) {
                    result.push(record);
                }
            });

            resolve(result);
        });
    }

    async setProgress(name, progress) {
        return new Promise((resolve) => {
            this.progress[name] = progress;
            resolve(true);
        });
        
    }

    async getProgress() {
        return new Promise((resolve) => {
            resolve(this.progress[name]);
        });
    }

    async getAllProgress() {
        return new Promise((resolve) => {
            resolve(this.progress);
        });
    }

    async getMaximumRecordsPosition() {
        return new Promise((resolve) => {
            var keys = Object.keys(this.records).map(val => parseInt(val, 10));
            return _.max(keys) || 0;
        });
    }

}

export default QueueDataProviderMock;