import { Ionicons } from "@expo/vector-icons";

export interface MessageBubble {
  width: number;
  height: number;
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
  className?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  iconColor?: string;
  topValue?: number;
  leftValue?: number;
  rightValue?: number;
  bottomValue?: number;
}