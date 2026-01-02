import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GameList() {
  return (
    <View style={styles.container}>
      <Text>Page GameList</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});