import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { evaluate } from 'mathjs';

type Token = {
  disp: string;
  expr: string;
  openPar?: number;
};

type RootMode = {
  active: boolean;
  stage: 'degree' | 'base' | null;
  degree: string;
  base: string;
};

const BUTTON_COLUMNS = [
  ['AC', '7', '4', '1', '0'],
  ['', '8', '5', '2', '0'],
  ['', '9', '6', '3', ','],
  ['/', '*', '-', '+', '='],
];

const BUTTON_COLUMNS_LANDSCAPE = [
  ['(', '2ⁿᵈ', '1/x', 'x!', 'Rad'],
  [')', 'x²', '√x', 'sin', 'sinh'],
  ['mc', 'x³', '∛x', 'cos', 'cosh'],
  ['m+', 'xʸ', 'ʸ√x', 'tan', 'tanh'],
  ['m-', 'eˣ', 'ln', 'e', 'π'],
  ['mr', '10ˣ', 'log₁₀', 'EE', 'Rand'],
  ['AC', '7', '4', '1', '0'],
  ['+/-', '8', '5', '2', '0'],
  ['%', '9', '6', '3', ','],
  ['/', '*', '-', '+', '='],
];

const TOKEN_MAP: Record<string, Token> = {
  '0': { disp: '0', expr: '0' },
  '1': { disp: '1', expr: '1' },
  '2': { disp: '2', expr: '2' },
  '3': { disp: '3', expr: '3' },
  '4': { disp: '4', expr: '4' },
  '5': { disp: '5', expr: '5' },
  '6': { disp: '6', expr: '6' },
  '7': { disp: '7', expr: '7' },
  '8': { disp: '8', expr: '8' },
  '9': { disp: '9', expr: '9' },
  ',': { disp: '.', expr: '.' },

  '+': { disp: '+', expr: '+' },
  '-': { disp: '-', expr: '-' },
  '*': { disp: '×', expr: '*' },
  '/': { disp: '÷', expr: '/' },
  '%': { disp: '%', expr: '/100' },

  'π': { disp: 'π', expr: 'pi' },
  'e': { disp: 'e', expr: 'e' },

  '√x': { disp: '√', expr: 'sqrt(', openPar: 1 },
  '∛x': { disp: '∛', expr: 'cbrt(', openPar: 1 },
  'ʸ√x': { disp: 'ʸ√x', expr: '' }, // handled separately
  'x²': { disp: '²', expr: '^2' },
  'x³': { disp: '³', expr: '^3' },
  'xʸ': { disp: '^', expr: '^(', openPar: 1 },
  '1/x': { disp: '1/', expr: '1/(', openPar: 1 },
  'x!': { disp: '!', expr: '!' },
  'eˣ': { disp: 'e^', expr: 'exp(', openPar: 1 },
  '10ˣ': { disp: '10^', expr: '10^(', openPar: 1 },

  'sin': { disp: 'sin', expr: 'sin(', openPar: 1 },
  'cos': { disp: 'cos', expr: 'cos(', openPar: 1 },
  'tan': { disp: 'tan', expr: 'tan(', openPar: 1 },
  'sinh': { disp: 'sinh', expr: 'sinh(', openPar: 1 },
  'cosh': { disp: 'cosh', expr: 'cosh(', openPar: 1 },
  'tanh': { disp: 'tanh', expr: 'tanh(', openPar: 1 },
  'ln': { disp: 'ln', expr: 'log(', openPar: 1 },
  'log₁₀': { disp: 'log₁₀', expr: 'log10(', openPar: 1 },

  '(': { disp: '(', expr: '(' },
  ')': { disp: ')', expr: ')' },
  'Rand': { disp: 'Rand', expr: 'random()' },
  'EE': { disp: 'EE', expr: 'e+' },
};

const Calculator: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [rootMode, setRootMode] = useState<RootMode>({
    active: false,
    stage: null,
    degree: '',
    base: '',
  });

  const [isRadian, setIsRadian] = useState(true);


  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const displayString = tokens.length === 0 ? '0' : tokens.map((t) => t.disp).join('');

  const buildExprString = () => {
    const expr = tokens.map((t) => t.expr).join('');
    const open = tokens.reduce((a, t) => a + (t.openPar || 0), 0);
    return expr + ')'.repeat(open);
  };

  const handlePress = (label: string) => {
    if (label === 'AC') {
      setTokens([]);
      setRootMode({ active: false, stage: null, degree: '', base: '' });
      return;
    }

    if (label === '=') {
      try {
        if (rootMode.active) {
          if (rootMode.degree && rootMode.base) {
            const expr = `nthRoot(${rootMode.base}, ${rootMode.degree})`;
            const result = evaluate(expr);
            setTokens([{ disp: String(result), expr: String(result) }]);
          } else setTokens([{ disp: 'Błąd', expr: '0' }]);
          setRootMode({ active: false, stage: null, degree: '', base: '' });
          return;
        }
        const expr = buildExprString();
        const result = evaluate(expr);
        setTokens([{ disp: String(result), expr: String(result) }]);
      } catch {
        setTokens([{ disp: 'Błąd', expr: '0' }]);
      }
      return;
    }

    if (rootMode.active) {
      if (rootMode.stage === 'degree') {
        if (label === ',') {
          if (!rootMode.degree) return;
          setRootMode((prev) => ({ ...prev, stage: 'base' }));
          setTokens([{ disp: '√', expr: '' }]);
          return;
        }
        if (!isNaN(Number(label))) {
          setRootMode((prev) => ({ ...prev, degree: prev.degree + label }));
          setTokens((prev) => [...prev, { disp: label, expr: '' }]);
        }
        return;
      }

      if (rootMode.stage === 'base') {
        if (!isNaN(Number(label))) {
          setRootMode((prev) => ({ ...prev, base: prev.base + label }));
          setTokens((prev) => [...prev, { disp: label, expr: '' }]);
          return;
        }
        if (label === ',') {
          setRootMode((prev) => ({ ...prev, base: prev.base + '.' }));
          setTokens((prev) => [...prev, { disp: '.', expr: '' }]);
          return;
        }
        return;
      }
      return;
    }

    if (label === 'ʸ√x') {
      setRootMode({ active: true, stage: 'degree', degree: '', base: '' });
      setTokens([]);
      return;
    }
    if (label in TOKEN_MAP) {
      const tk = TOKEN_MAP[label];
      if (!tk.expr) return;
      setTokens((prev) => [...prev, { disp: tk.disp, expr: tk.expr, openPar: tk.openPar }]);
      return;
    }

    if (label) {
      setTokens((prev) => [...prev, { disp: label, expr: label }]);
    }
  };

  const currentColumns = isLandscape ? BUTTON_COLUMNS_LANDSCAPE : BUTTON_COLUMNS;

  return (
    <View style={styles.container}>
      <View style={[styles.displayContainer, isLandscape && styles.displayLandscape]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={[styles.displayText, isLandscape && styles.displayTextLandscape]}>
            {displayString}
          </Text>
        </ScrollView>
      </View>

      <View style={[styles.buttonsContainer, isLandscape && styles.buttonsLandscape]}>
        {currentColumns[0].map((_, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {currentColumns.map((col, colIndex) => {
              const label = col[rowIndex];
              let value = label;
              let flexStyle: any = {};

              // ======= ПОРТРЕТНИЙ РЕЖИМ =======
              if (!isLandscape) {
                if (rowIndex === 0 && (colIndex === 1 || colIndex === 2)) {
                  if (colIndex === 1) {
                    flexStyle = { flex: 2 };
                    value = '';
                  } else if (colIndex === 2) return null;
                }

                if (
                  rowIndex === currentColumns[0].length - 1 &&
                  (colIndex === 0 || colIndex === 1)
                ) {
                  if (colIndex === 0) {
                    flexStyle = { flex: 2 };
                    value = '0';
                  } else if (colIndex === 1) return null;
                }
              }

              // ======= ГОРИЗОНТАЛЬНИЙ РЕЖИМ =======
              if (isLandscape) {
                if (rowIndex === 4 && (colIndex === 6 || colIndex === 7)) {
                  if (colIndex === 6) {
                    flexStyle = { flex: 2 };
                    value = '0';
                  } else if (colIndex === 7) return null;
                }
              }

              const isOperator = ['/', '*', '-', '+', '='].includes(value);
              const isAC = value === 'AC';
              const isEmpty = !value;

              let bg = '#808080';
              if (isOperator) bg = 'orange';
              else if (isAC || isEmpty) bg = '#333';
              else if (!isOperator && value && isNaN(Number(value)) && value !== ',') bg = '#333';

              if (isEmpty)
                return (
                  <View
                    key={colIndex}
                    style={[styles.button, flexStyle, { backgroundColor: '#222' }]}
                  />
                );

              return (
                <TouchableOpacity
                  key={colIndex}
                  style={[styles.button, flexStyle, { backgroundColor: bg }]}
                  onPress={() => handlePress(value)}
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
  container: { flex: 1, backgroundColor: '#333', justifyContent: 'flex-end' },
  displayContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  displayLandscape: { height: 70 },
  displayText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  displayTextLandscape: { fontSize: 28 },
  buttonsContainer: { height: 400 },
  buttonsLandscape: { height: 260 },
  row: { flexDirection: 'row', flex: 1 },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#000',
  },
  buttonText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
});

export default Calculator;
