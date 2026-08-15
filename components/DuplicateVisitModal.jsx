import React from "react";
import { View, Text, Modal, Dimensions } from "react-native";
import Pressable from "./SystemPressable";

const { width, height } = Dimensions.get("window");
const scale = Math.min(Math.max(width / 400, 0.8), 1.8);
const isPhone = width < 600;

const maskContact = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length < 4) return value || "-";
  return `${digits.slice(0, 2)}${"*".repeat(Math.max(0, digits.length - 5))}${digits.slice(-3)}`;
};

const maskEmail = (value) => {
  const email = String(value || "").trim();
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email || "-";
  const visible = localPart.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(2, localPart.length - 2))}@${domain}`;
};

export default function DuplicateVisitModal({
  visible,
  onClose,
  onProceed,
  visitorData,
  variant = "duplicate",
}) {
  const {
    name,
    address,
    contactNumber,
    email,
    office,
    purpose,
    checkInTime,
  } = visitorData || {};
  const isPossibleMatch = variant === "possible";

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

  const detailItems = isPossibleMatch
    ? [
        { label: "Matched Name", value: name },
        { label: "Address", value: address },
        { label: "Contact", value: maskContact(contactNumber) },
        { label: "Email", value: maskEmail(email) },
        { label: "Last Check-in", value: formatTime(checkInTime) },
      ]
    : [
        { label: "Name", value: name },
        { label: "Office", value: office },
        { label: "Purpose", value: purpose },
        { label: "Check-in Time", value: formatTime(checkInTime) },
      ];

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
          <Text
            style={{
              fontSize: sizes.titleFont,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: sizes.modalPadding * 0.6,
              color: isPossibleMatch ? "#4F46E5" : "#DC2626",
            }}
          >
            {isPossibleMatch ? "Possible Same Visitor" : "Visitor Already Checked In"}
          </Text>

          <View
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: sizes.detailsBorderRadius,
              padding: sizes.detailsPadding,
              marginBottom: sizes.modalPadding,
            }}
          >
            {detailItems.map((item, idx) => (
              <Text
                key={item.label}
                style={{
                  color: "#374151",
                  fontSize: sizes.visitorLabelFont,
                  marginBottom: idx < detailItems.length - 1 ? sizes.visitorMarginBottom : 0,
                }}
              >
                <Text style={{ fontWeight: "600" }}>{item.label}: </Text>
                {item.value || "-"}
              </Text>
            ))}
          </View>

          <Text
            style={{
              textAlign: "center",
              color: "#4B5563",
              marginBottom: sizes.modalPadding,
              fontSize: sizes.descFont,
              lineHeight: sizes.descFont * 1.5,
            }}
          >
            {isPossibleMatch
              ? "This name looks similar to a previous visitor. If this is you, use the saved address and contact details. Otherwise, continue as a different visitor."
              : "This visitor is still checked in from a previous visit today. Please check out first before creating a new check-in."}
          </Text>

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
                {isPossibleMatch ? "Different Visitor" : "Cancel"}
              </Text>
            </Pressable>

            <Pressable
              onPress={onProceed}
              style={{
                flex: 1,
                marginLeft: sizes.buttonMargin,
                height: sizes.buttonHeight,
                borderRadius: sizes.buttonRadius,
                backgroundColor: isPossibleMatch ? "#4F46E5" : "#F97316",
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
                {isPossibleMatch ? "Use Details" : "Go to Check Out"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
