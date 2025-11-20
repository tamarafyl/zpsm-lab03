import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { evaluate } from 'mathjs';


import CalculatorButton from './CalculatorButton';

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

  '√x': { disp: '√(', expr: 'sqrt(', openPar: 1 },
  '∛x': { disp: '∛(', expr: 'cbrt(', openPar: 1 },
  'ʸ√x': { disp: 'ʸ√x', expr: '' },
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
const TOKEN_MAP_SECOND: Record<string, Token> = {
  'sin': { disp: 'sin⁻¹', expr: 'asin(', openPar: 1 },
  'cos': { disp: 'cos⁻¹', expr: 'acos(', openPar: 1 },
  'tan': { disp: 'tan⁻¹', expr: 'atan(', openPar: 1 },
  'sinh': { disp: 'sinh⁻¹', expr: 'asinh(', openPar: 1 },
  'cosh': { disp: 'cosh⁻¹', expr: 'acosh(', openPar: 1 },
  'tanh': { disp: 'tanh⁻¹', expr: 'atanh(', openPar: 1 },
  'ln': { disp: 'log₂', expr: 'log2(', openPar: 1 },      // Змінюємо ln на log₂
  'log₁₀': { disp: 'logᵧ', expr: '' },                    // log₁₀ стане logᵧ (поки без реалізації)
  'eˣ': { disp: '2ˣ', expr: '2^(', openPar: 1 },          // eˣ стане 2ˣ
  '10ˣ': { disp: 'yˣ', expr: '^(', openPar: 1 },          // 10ˣ стане yˣ (як звичайний степінь)
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

  const [memory, setMemory] = useState<number>(0);
  const [isSecondActive, setIsSecondActive] = useState(false);

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

    if (label === 'Rad') {
        setIsRadian((prev) => !prev);
        return;
    }

if (['mc', 'mr', 'm+', 'm-'].includes(label)) {
    let currentValue = 0;
    try {
        // Обчислюємо поточне значення на екрані, щоб додати/відняти його
        currentValue = evaluate(buildExprString());
    } catch {
        // Якщо вираз недійсний, вважаємо поточне значення за 0
        currentValue = 0;
    }
 switch (label) {
        case 'mc':
            setMemory(0);
            break;
        case 'mr':
            // Додаємо число з пам'яті до поточного виразу
            setTokens((prev) => [...prev, { disp: String(memory), expr: String(memory) }]);
            break;
        case 'm+':
            setMemory((prevMemory) => prevMemory + currentValue);
            // Очищуємо екран після операції з пам'яттю
            setTokens([]);
            break;
        case 'm-':
            setMemory((prevMemory) => prevMemory - currentValue);
            // Очищуємо екран після операції з пам'яттю
            setTokens([]);
            break;
    }
    return; // Завершуємо обробку
}
 if (label === '2ⁿᵈ') {
        setIsSecondActive((prev) => !prev);
        return;
    }

    if (label === '+/-') {
        setTokens((prev) => {
            if (prev.length === 0) {
                return [{ disp: '-', expr: '-' }];
            }
            // Шукаємо останній оператор
            let lastOperatorIndex = -1;
            for (let i = prev.length - 1; i >= 0; i--) {
                if (['+', '-', '*', '/'].includes(prev[i].expr)) {
                    lastOperatorIndex = i;
                    break;
                }
            }
         // Якщо операторів немає, змінюємо знак всього виразу
                    if (lastOperatorIndex === -1) {
                        if (prev[0].expr === '-') {
                            return prev.slice(1); // Видалити мінус
                        } else {
                            return [{ disp: '-', expr: '-' }, ...prev]; // Додати мінус
                        }
                    }
                    // Якщо є оператор, змінюємо знак числа після нього
                    const numberPart = prev.slice(lastOperatorIndex + 1);
                    if (numberPart.length === 0) return prev; // Немає числа для зміни знаку

                    if (prev[lastOperatorIndex + 1].expr === '-') {
                         prev.splice(lastOperatorIndex + 1, 1); // Видалити мінус
                         return [...prev];
                    } else {
                        prev.splice(lastOperatorIndex + 1, 0, { disp: '-', expr: '-' }); // Додати мінус
                                         return [...prev];
                                    }
                                });
                                return;
                            }

                            if (label === '%') {
                                setTokens((prev) => [...prev, { disp: '%', expr: '/100' }]);
                                // Для більш складної логіки відсотків потрібні значні зміни
                                return;
                            }
    if (label === '=') {
      try {
        // Блок для режиму кореня (його ми не чіпаємо)
        if (rootMode.active) {
          if (rootMode.degree && rootMode.base) {
            const expr = `nthRoot(${rootMode.base}, ${rootMode.degree})`;
            // Просто обчислюємо, без логіки Rad/Deg
            const result = evaluate(expr);
            setTokens([{ disp: String(result), expr: String(result) }]);
          } else {
            setTokens([{ disp: 'Błąd', expr: '0' }]);
          }
          setRootMode({ active: false, stage: null, degree: '', base: '' });
          return;
        }

        // Блок для всіх інших обчислень (ось тут правильне місце!)
        const expr = buildExprString();

        // --- ВСТАВТЕ ЛОГІКУ Rad/Deg СЮДИ ---
        let result;
        if (isRadian) {
          // Режим "Rad", обчислюємо як є
          result = evaluate(expr);
        } else {
          // Режим "Deg", перевизначаємо тригонометричні функції
          const scope = {
            sin: (x: number) => Math.sin((x * Math.PI) / 180),
            cos: (x: number) => Math.cos((x * Math.PI) / 180),
            tan: (x: number) => Math.tan((x * Math.PI) / 180),
          };
          result = evaluate(expr, scope);
        }
        // ------------------------------------

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
    const currentTokenMap = isSecondActive ? TOKEN_MAP_SECOND : TOKEN_MAP;

        if (label in currentTokenMap) {
          const tk = currentTokenMap[label];
          if (tk.expr === '') {
            // Сюди можна додати логіку для кнопок типу logᵧ, якщо потрібно
            return;
          }
          setTokens((prev) => [...prev, { disp: tk.disp, expr: tk.expr, openPar: tk.openPar }]);
          // Вимикаємо режим 2ⁿᵈ після натискання іншої кнопки
          setIsSecondActive(false);
          return;
        }
    // Якщо кнопка не знайдена в активній мапі, перевіримо основну
        else if (label in TOKEN_MAP) {
          const tk = TOKEN_MAP[label];
          if (!tk.expr) return;
          setTokens((prev) => [...prev, { disp: tk.disp, expr: tk.expr, openPar: tk.openPar }]);
          setIsSecondActive(false);
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

              if (value === 'Rad') {
                  value = isRadian ? 'Rad' : 'Deg'; // Динамічно змінюємо текст
                }

             if (isSecondActive && label in TOKEN_MAP_SECOND) {
                            value = TOKEN_MAP_SECOND[label].disp;
                          }

              let flexStyle: any = {};

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

              const isSecondButtonActive = value === '2ⁿᵈ' && isSecondActive;

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
                <CalculatorButton
                  key={colIndex}
                  title={value}
                  backgroundColor={bg}
                  borderColor="#000"
                  disable={!value}
                  onPress={() => handlePress(value)}
                  color="#fff"
                  flexStyle={flexStyle}
                />
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
