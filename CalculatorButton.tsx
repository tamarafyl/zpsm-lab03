import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

type Props = {
  title: string;
  backgroundColor: string;
  borderColor: string;
  disable: boolean;
  onPress: () => void;
  color: string;
  flexStyle?: any;
};

const CalculatorButton: React.FC<Props> = ({
  title,
  backgroundColor,
  borderColor,
  disable,
  onPress,
  color,
  flexStyle,
}) => {
  return (
    <TouchableOpacity
      disabled={disable}
      onPress={onPress}
      style={[
        styles.button,
        flexStyle,
        { backgroundColor, borderColor },
        disable && { opacity: 0.3 },
      ]}
    >
      <Text style={[styles.text, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default CalculatorButton;
