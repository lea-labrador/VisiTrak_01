// components/SelectField.jsx
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { View, useWindowDimensions, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";

const SelectField = forwardRef(({
  icon,
  selectedValue,
  onValueChange,
  placeholder,
  options,
  hasError,
  disabled,
  disabledTextColor,
  fontSize, // New prop for dynamic font size
}, ref) => {
  const pickerRef = useRef(null);
  const { width } = useWindowDimensions();
  
  // Responsive scaling
  const scale = Math.min(Math.max(width / 400, 0.8), 1.8);
  const isPhone = width < 600;

  // Font scale multiplier (can be adjusted dynamically)
  const fontScale = 1.0; // Adjust this to change font size (0.8 = smaller, 1.2 = larger)

  // Responsive size values
  const sizes = {
    containerBorderRadius: 8 * scale,
    containerPaddingH: 12 * scale,
    containerPaddingV: 8 * scale,
    containerMarginB: 12 * scale,
    containerBorderWidth: 2,
    iconMarginRight: 8 * scale,
    pickerFontSize: fontSize || (16 * scale * fontScale), // Use provided fontSize or default with fontScale
  };

  useImperativeHandle(ref, () => ({
    focus: () => {
      pickerRef.current?.focus?.();
    }
  }));

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderRadius: sizes.containerBorderRadius,
        paddingHorizontal: sizes.containerPaddingH,
        paddingVertical: sizes.containerPaddingV,
        marginBottom: sizes.containerMarginB,
        backgroundColor: "rgba(199, 210, 254, 0.7)", // indigo-200/70
        borderWidth: sizes.containerBorderWidth,
        borderColor: hasError ? "red" : "rgba(107,114,128,0.7)",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <View style={{ marginRight: sizes.iconMarginRight }}>
        {icon}
      </View>

      <Picker
        ref={pickerRef}
        enabled={!disabled}
        selectedValue={selectedValue}
        onValueChange={(val) => {
          if (!disabled) onValueChange(val);
        }}
        dropdownIconColor={disabled ? "#888" : "#4967e3"}
        style={{ 
          flex: 1, 
          color: disabled ? (disabledTextColor || '#6b7280') : undefined,
          fontSize: sizes.pickerFontSize, // Apply dynamic font size
        }}
        itemStyle={Platform.OS === 'ios' ? {
          fontSize: sizes.pickerFontSize, // iOS specific font size
        } : undefined}
      >
        <Picker.Item 
          label={placeholder} 
          value="" 
          color={disabled ? (disabledTextColor || '#6b7280') : '#000000ff'}
          style={{ fontSize: sizes.pickerFontSize }} // Apply to placeholder
        />

        {options.map((opt, i) => (
          <Picker.Item 
            key={i} 
            label={opt} 
            value={opt}
            style={{ fontSize: sizes.pickerFontSize }} // Apply to each option
          />
        ))}
      </Picker>
    </View>
  );
});

export default SelectField;