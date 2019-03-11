import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { QueueDataProviderSQLite } from './src';
import 'react-native-console-time-polyfill';
import data from './data/item.json';

export default class App extends React.Component {
  componentDidMount() {
    this.test();
  }

  getOptionsPrice(options) {
    var total = 0;
    
    for(option of options) {
      if (option.supplement === 0) {
        total += option.price;
      }
    }

    return total;
  }

  async test() {
    const db = new QueueDataProviderSQLite('test.db');
    await db.init();

    const records = await db.getRecordsCount();
    console.log(records);
    const max = await db.getMaximumPosition(); 
    console.log(max);
  }

  render() {

    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
