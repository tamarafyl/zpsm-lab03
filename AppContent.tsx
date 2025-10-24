import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const AppContent = () => {
  const [showName, setShowName] = useState(true);

  const toggleName = () => setShowName(prev => !prev);

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Zadanie 2</Text>
      <TouchableOpacity style={styles.button} onPress={toggleName}>
        <Text style={styles.buttonText}>
          {showName ? 'Ukryj imię' : 'Pokaż imię'}
        </Text>
      </TouchableOpacity>

      {showName && (
        <>
          <Text style={styles.normalText}>Nazywam się</Text>
          <Text style={styles.boldText}>Tamara Fyl</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  titleText: {
    fontSize: 20,
    marginBottom: 16,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 255, 0.5)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  normalText: {
    fontSize: 18,
    fontWeight: 'normal',
  },
  boldText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AppContent;
