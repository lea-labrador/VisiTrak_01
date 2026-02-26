import React, { forwardRef } from "react";
import { View, TextInput } from "react-native";

const InputField = forwardRef(
  (
    {
      icon,
      placeholder,
      value,
      onChangeText,
      uppercase = false,
      hasError = false,
      onSubmitEditing,
      returnKeyType = "next",
      keyboardType = "default",
      autoCorrect = false,
      spellCheck = false,
      autoComplete = "off",
      textContentType = "none",
      autoCapitalize,
      scale = 1,
      fontSize,
      ...textInputProps
    },
    ref
  ) => {
    const resolvedAutoCapitalize =
      autoCapitalize ?? (uppercase ? "characters" : "none");

    const handleChangeText = (text) => {
      if (uppercase) {
        onChangeText?.(text.toUpperCase());
      } else {
        onChangeText?.(text);
      }
    };

    return (
      <View
        className="flex-row items-center bg-indigo-200/70 rounded-lg px-8 py-3 mb-3"
        style={{
          borderWidth: 2,
          borderColor: hasError ? "red" : "rgba(107,114,128,0.7)",
        }}
      >
        {icon && <View style={{ marginRight: 20 }}>{icon}</View>}

        <TextInput
          ref={ref}
          placeholder={placeholder}
          placeholderTextColor={hasError ? "red" : "#000"}
          value={value}
          onChangeText={handleChangeText}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          keyboardType={keyboardType}
          style={{
            flex: 1,
            fontSize: fontSize ?? 16 * scale,
            color: "#000",
          }}
          autoCapitalize={resolvedAutoCapitalize}
          autoCorrect={autoCorrect}
          spellCheck={spellCheck}
          autoComplete={autoComplete}
          textContentType={textContentType}
          importantForAutofill="no"
          {...textInputProps}
        />
      </View>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
