import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MessageBubble } from "../interface/MessageBubble";

export default function MessageBubbleShape(props: MessageBubble) {
  return (
    <View
      className={`items-center justify-center ${props.className ?? ""}`}
      style={{
        width: props.width,
        height: props.height,
        borderRadius: props.borderRadius ?? 20,
        backgroundColor: props.backgroundColor ?? "#e0f7fa",
        position: "absolute",
        ...(props.borderColor && { borderColor: props.borderColor }),
        ...(props.borderWidth && { borderWidth: props.borderWidth }),
        ...(props.topValue !== undefined && { top: props.topValue }),
        ...(props.leftValue !== undefined && { left: props.leftValue }),
        ...(props.rightValue !== undefined && { right: props.rightValue }),
        ...(props.bottomValue !== undefined && { bottom: props.bottomValue }),
        opacity: props.opacity ?? 1,
        zIndex: 0,
      }}
    >
      {props.iconName && (
        <Ionicons
          name={props.iconName as any}
          size={props.iconSize ?? 24}
          color={props.iconColor ?? "#00796b"}
        />
      )}
    </View>
  );
}
