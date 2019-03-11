import _ from 'lodash';
import { 
    Queue,
    QueueDataProviderMock 
} from './';

var q = null;

const delay = async (time = 1000) => {
    return new Promise((resolve) => {
        setTimeout(() => { 
            resolve(); 
        }, time);
    });
}; 

it('test #1', () => {
    q = new Queue(new QueueDataProviderMock());

    expect(q).toEqual({
        db: expect.any(QueueDataProviderMock),
        workers: {},
        status: {},
        progress: {},
        cache: {}
    });
});

it('test #2', () => {
    q.addWorker('test-worker-1', async (rec) => {
        return new Promise((resolve) => {
            if(rec.type !== 'test-job') {
                resolve(true);
                return true;
            }

            console.log(`test-worker-1 take place: ${rec.data}`);
            resolve(true);
        });
    });

    q.addWorker('test-worker-2', async (rec) => {
        return new Promise((resolve) => {
            if(rec.type !== 'test-job') {
                resolve(true);
                return true;
            }

            setTimeout(() => {
                console.log(`test-worker-2 take place: ${rec.data}`);
                resolve(true);
            }, 600);
            
        });
    });

    
    q.addWorker('test-worker-3', async (rec) => {
        return new Promise((resolve) => {
            if(rec.type !== 'test-job-another') {
                resolve(true);
                return true;
            }

            console.log(`test-worker-3 take place: ${rec.data}`);
            resolve(true);
        });
    });

    expect(_.size(q.workers)).toBe(3);
});


it('test #3', async () => {
    await q.addJob('test-job', 'tes job data 1');
    await q.addJob('test-job', 'tes job data 2');
    await q.addJob('test-job', 'tes job data 3');
    await q.addJob('test-job-another', 'tes job data 4');
    
    const records = await q.getAllRecords();

    expect(_.size(records)).toBe(4);
});


it('test #4', async () => {
    q.start();

    await delay();
    q.addJob('test-job-another', 'tes job data 5');

    expect(q.progress).toEqual({
        'test-worker-1': 4, 
        'test-worker-2': 1, 
        'test-worker-3': 4
    });

    await delay();
    
    expect(q.progress).toEqual({
        'test-worker-1': 5, 
        'test-worker-2': 5, 
        'test-worker-3': 5
    });
});

it("test Queue.chargeWorker", async () => {
    var totalCalls = 0;
    var directCalls = 0;
    const testWorker = async (record) => {
        return new Promise((resolve) => {
            totalCalls++;

            if (record.type !== 'test-job-another') {
                resolve(true);
                return true;
            }

            setTimeout(() => {
                directCalls++;
                console.log(`i am charged worker:`);
                console.log(record);
                resolve(true);
            }, 500);
        });
    };

    q.chargeWorker(testWorker, 0, 5);
    await delay(3000);

    expect(totalCalls).toBe(5);
    expect(directCalls).toBe(2);
});