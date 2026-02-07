import React from "react";
import { View, Text, Modal, Pressable, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const scale = Math.min(Math.max(width / 400, 0.8), 1.8);
const isPhone = width < 600;

export default function DuplicateVisitModal({ visible, onClose, onProceed, visitorData }) {
  const { name, office, purpose, checkInTime } = visitorData || {};

  // Precomputed dynamic sizes
  const sizes = {
    modalPadding: 20 * scale,
    modalBorderRadius: 24 * scale,
    titleFont: 20 * scale,
    descFont: 14 * scale,
    visitorLabelFont: 14 * scale,
    visitorMarginBottom: 6 * scale,
    buttonFont: 16 * scale,
    buttonHeight: 50 * scale,
    buttonRadius: 12 * scale,
    buttonMargin: 8 * scale,
    detailsPadding: 12 * scale,
    detailsBorderRadius: 12 * scale,
    modalWidth: isPhone ? "90%" : 400 * scale, 
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("en-PH", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: sizes.modalPadding,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: sizes.modalBorderRadius,
            padding: sizes.modalPadding,
            width: sizes.modalWidth,
            maxHeight: height * 0.85,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: sizes.titleFont,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: sizes.modalPadding * 0.6,
              color: "#DC2626",
            }}
          >
            Visitor Already Checked In
          </Text>

          {/* Visitor Details */}
          <View
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: sizes.detailsBorderRadius,
              padding: sizes.detailsPadding,
              marginBottom: sizes.modalPadding,
            }}
          >
            {[
              { label: "Name", value: name },
              { label: "Office", value: office },
              { label: "Purpose", value: purpose },
              { label: "Check-in Time", value: formatTime(checkInTime) },
            ].map((item, idx) => (
              <Text
                key={idx}
                style={{
                  color: "#374151",
                  fontSize: sizes.visitorLabelFont,
                  marginBottom: idx < 3 ? sizes.visitorMarginBottom : 0,
                }}
              >
                <Text style={{ fontWeight: "600" }}>{item.label}: </Text>
                {item.value || "-"}
              </Text>
            ))}
          </View>

          {/* Description */}
          <Text
            style={{
              textAlign: "center",
              color: "#4B5563",
              marginBottom: sizes.modalPadding,
              fontSize: sizes.descFont,
              lineHeight: sizes.descFont * 1.5,
            }}
          >
            This visitor is still checked in from a previous visit today. Please
            check out first before creating a new check-in.
          </Text>

          {/* Buttons */}
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                marginRight: sizes.buttonMargin,
                height: sizes.buttonHeight,
                borderRadius: sizes.buttonRadius,
                backgroundColor: "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#374151",
                  fontWeight: "600",
                  fontSize: sizes.buttonFont,
                }}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={onProceed}
              style={{
                flex: 1,
                marginLeft: sizes.buttonMargin,
                height: sizes.buttonHeight,
                borderRadius: sizes.buttonRadius,
                backgroundColor: "#F97316",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "600",
                  fontSize: sizes.buttonFont,
                }}
              >
                Go to Check Out
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
