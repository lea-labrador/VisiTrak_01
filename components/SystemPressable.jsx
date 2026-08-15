import { forwardRef } from "react";
import { Pressable } from "react-native";

const SystemPressable = forwardRef(function SystemPressable(props, ref) {
  return <Pressable ref={ref} android_disableSound={false} {...props} />;
});

export default SystemPressable;
