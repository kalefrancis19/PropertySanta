import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TaskDetailScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Task Detail Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  text: {
    fontSize: 24,
    color: '#3b82f6',
  },
});

export default TaskDetailScreen; 