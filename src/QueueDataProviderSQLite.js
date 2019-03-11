import QueueDataProvider from './QueueDataProvider';
import { SQLite } from 'expo';

class QueueDataProviderSQLite extends QueueDataProvider {
    constructor(db_name) {
        super();
        if(!db_name || db_name == '') {
            throw new Error('You hould specify database name for QueueDataProviderSQLite');
        }

        this.db = SQLite.openDatabase(db_name);
    }

    async init() {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(
                    'create table if not exists records (id integer primary key asc autoincrement not null , type text, data blob);',
                    [],
                    () => {
                        console.log('QueueDataProviderSQLite: records table successfuly created');
                    },
                    () => {
                        console.log('QueueDataProviderSQLite: records table creation failed');
                    }
                );
    
                tx.executeSql(
                    'create table if not exists progress (name text primary key not null , progress int );',
                    [],
                    () => {
                        console.log('QueueDataProviderSQLite: progress table successfuly created');
                    },
                    () => {
                        console.log('QueueDataProviderSQLite: progress table creation failed');
                    }
                );
            }, 
            () => {
                console.log('QueueDataProviderSQLite.init() failed');
                reject();
            },
            () => {
                console.log('QueueDataProviderSQLite.init() success');
                resolve();
            });
        });
    }

    async addRecord(type, data) {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql('insert into records (type, data) values (?, ?)', 
                [type, JSON.stringify(data)], 
                (_, {rows: { _array }}) => {
                    resolve(_array)
                },
                () => {
                    console.log('Error while QueueDataProviderSQLite.addJob');
                    reject(false);
                });
            },
            () => {},
            () => {});
        });
    }

    async getRecord(id) {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql('select * from records where id = ?', 
                [id], 
                (_, {rows: { _array }}) => {
                    resolve(_array);
                },
                () => {
                    console.log('Error while QueueDataProviderSQLite.getRecord');
                    reject();
                });
            });
        });
    }

    async getRecordsFrom(id = 0) {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql('select * from records where id > ?', 
                [id], 
                (_, {rows: { _array }}) => {
                    resolve(_array);
                },
                () => {
                    console.log('Error while QueueDataProviderSQLite.getAllRecords');
                    reject();
                });
            });
        });
    }

    async setProgress(name, value) {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql('insert or replace into progress (name, progress) values (?, ?)', 
                [name, value], 
                (_, {rows: { _array }}) => {
                    resolve(_array);
                },
                (e) => {
                    console.log('Error while QueueDataProviderSQLite.setProgress:');
                    console.log(e);
                    reject();
                });
            });
        });
    }

    async getProgress(name) {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql('select * from progress where name = ?', 
                [name], 
                (_, {rows: { _array }}) => {
                    resolve(_array);
                },
                () => {
                    console.log('Error while QueueDataProviderSQLite.getAllProgress');
                    reject();
                });
            });
        });
    }

    async getAllProgress() {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql('select * from progress', 
                [], 
                (_, {rows: { _array }}) => {
                    resolve(_array);
                },
                () => {
                    console.log('Error while QueueDataProviderSQLite.getAllProgress');
                    reject();
                });
            });
        });
    }

    async getRecordsCount() {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql('select count(*) from records', 
                [], 
                (_, { rows: { _array }}) => {
                    if (_array[0]['count(*)']) {
                        resolve(_array[0]['count(*)']);
                    }

                    resolve(0);
                },
                () => {
                    console.log('Error while QueueDataProviderSQLite.getRecordsCount');
                    reject();
                });
            });
        });
    }

    async getMaximumRecordsPosition() {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql("select max(id) from records",
                [],
                (_, { rows: { _array }}) => {
                    if (_array[0]['max(id)']) {
                        resolve(_array[0]['max(id)']);
                    }

                    resolve(0);
                },
                () => {
                    console.log('Error while QueueDataProviderSQLite.getMaximumRecordsPosition');
                    reject(null);
                });
            });
        });
    }

    async getRecordsFromTo(from, to) {
        return new Promise(async (resolve, reject) => {
            if (!from || from < 0) from = 0;
            if (!to || to <= 0) to = await this.getMaximumRecordsPosition();

            this.db.transaction(tx => {
                tx.executeSql('select * from records where id between ? and ?', 
                [from, to], 
                (_, {rows: { _array }}) => {
                    resolve(_array);
                },
                () => {
                    console.log('Error while QueueDataProviderSQLite.getRecordsFromTo');
                    reject();
                });
            });
        });
    }

    async drop() {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(
                    'drop table if exists records',
                    [],
                    () => {
                        console.log('QueueDataProviderSQLite: records table successfuly droped');
                    },
                    () => {
                        console.log('QueueDataProviderSQLite: records table wasn\'t droped');
                    }
                );
    
                tx.executeSql(
                    'drop table if exists progress',
                    [],
                    () => {
                        console.log('QueueDataProviderSQLite: progress table successfuly droped');
                    },
                    () => {
                        console.log('QueueDataProviderSQLite: progress table wasn\'t droped');
                    }
                );
            }, 
            () => { 
                console.log('QueueDataProviderSQLite.drop() failed');
                reject();
            },
            () => {
                console.log('QueueDataProviderSQLite.drop() success');
                resolve();
            });
        });
    }
}

export default QueueDataProviderSQLite;