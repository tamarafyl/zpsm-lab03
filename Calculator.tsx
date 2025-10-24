import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const Calculator = () => {
  const [display, setDisplay] = useState('');

  const handlePress = (value: string) => {
    if (value === 'AC') {
      setDisplay('');
    } else if (value === '=') {
      try {
        setDisplay(eval(display).toString());
      } catch {
        setDisplay('Błąd');
      }
    } else {
      setDisplay(display + value);
    }
  };

  const columns = [
    ['AC', '7', '4', '1', '0'],
    ['', '8', '5', '2', ' '],
    ['', '9', '6', '3', '.'],
    ['/', '*', '-', '+', '='],
  ];

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.displayText}>{display || '0'}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        {columns[0].map((_, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {columns.map((col, colIndex) => {
              let value = col[rowIndex];
              const isOperator = ['/', '*', '-', '+', '='].includes(value);
              const isAC = value === 'AC';
              const isEmpty = value === '';
              let bgColor = '#808080';

              if (isOperator) bgColor = 'orange';
              if (isAC || isEmpty) bgColor = '#333';

              // Об’єднання двох порожніх кнопок у верхньому рядку
              let flexStyle = {};
              if (rowIndex === 0 && (colIndex === 1 || colIndex === 2)) {
                if (colIndex === 1) {
                  flexStyle = { flex: 2 }; // перша кнопка займає простір двох
                  value = ''; // залишаємо порожню
                } else if (colIndex === 2) {
                  return null; // другу не рендеримо
                }
              }

              return (
                <TouchableOpacity
                  key={colIndex}
                  style={[styles.button, flexStyle, { backgroundColor: bgColor }]}
                  onPress={() => value && handlePress(value)}
                  disabled={isEmpty}
                >
                  <Text style={styles.buttonText}>{value}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'flex-end',
  },
  displayContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: '#3333',
    paddingHorizontal: 10,
  },
  displayText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonsContainer: {
    height: 400,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#000',
  },
  noRightBorder: {
    borderRightWidth: 0,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Calculator;
