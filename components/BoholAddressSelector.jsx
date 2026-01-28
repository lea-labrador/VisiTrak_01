import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from '@expo/vector-icons';
import { 
  getMunicipalities,
  getBarangays,
  formatAddressForDB
} from "../data/boholAddressData";

const BoholAddressSelector = forwardRef(({ 
  homeAddress, 
  setHomeAddress, 
  errors,
  onAddressChange,
  onAddressPartsChange,
  onSubmitEditing
}, ref) => {
  const { width } = useWindowDimensions();
  const scale = Math.min(Math.max(width / 400, 0.8), 1.8);
  const isPhone = width < 600;

  // Responsive sizes object
  const sizes = {
    containerPadding: 12 * scale,
    pickerPaddingHorizontal: 16 * scale,
    pickerPaddingVertical: 3 * scale,
    pickerBorderRadius: 5 * scale,
    pickerMarginBottom: 12 * scale,
    iconSize: 20 * scale,
    fontSmall: 12 * scale,
    fontMedium: 14 * scale,
    fontLarge: 16 * scale,
    selectedAddressPadding: 12 * scale,
    selectedAddressBorderWidth: 4 * scale,
    selectedAddressBorderRadius: 12 * scale,
    errorFont: 12 * scale,
  };

  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");
  const municipalityPickerRef = useRef(null);
  const barangayPickerRef = useRef(null);

  const municipalities = getMunicipalities();
  const barangayList = municipality ? getBarangays(municipality) : [];

  // Expose focus method to parent
  useImperativeHandle(ref, () => ({
    focus: () => {
      municipalityPickerRef.current?.focus?.();
    }
  }));

  useEffect(() => {
    if (onAddressPartsChange) onAddressPartsChange({ municipality, barangay });

    if (municipality && barangay) {
      const fullAddress = `${barangay}, ${municipality}, Bohol`;
      setHomeAddress(fullAddress);

      if (onAddressChange) {
        const dbFormat = formatAddressForDB(municipality, barangay);
        onAddressChange(dbFormat);
      }

      if (onSubmitEditing) onSubmitEditing();
    } else {
      setHomeAddress("");
      if (onAddressChange) onAddressChange(null);
    }
  }, [municipality, barangay]);

  useEffect(() => {
    if (homeAddress && !municipality && !barangay) {
      const parts = homeAddress.split(", ");
      if (parts.length >= 2) {
        const [brgy, mun] = parts;
        setBarangay(brgy);
        setMunicipality(mun);
      }
    }
  }, []);

  const handleMunicipalityChange = (value) => {
    setMunicipality(value);
    setBarangay("");

    if (value) {
      setTimeout(() => {
        barangayPickerRef.current?.focus?.();
      }, 300);
    }
  };

  const handleBarangayChange = (value) => {
    setBarangay(value);
  };

  return (
    <View style={{ marginTop: sizes.containerPadding }}>
      {/* Municipality Section */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(169, 172, 218, 0.87)',
          borderRadius: sizes.pickerBorderRadius,
          paddingHorizontal: sizes.pickerPaddingHorizontal,
          paddingVertical: sizes.pickerPaddingVertical,
          marginBottom: sizes.pickerMarginBottom,
          borderWidth: 2,
          borderColor: errors?.homeAddress ? 'red' : '#8d8d8dff'
        }}
      >
        <Ionicons name="map-outline" size={sizes.iconSize} color="#0a3aca" style={{ marginRight: sizes.pickerPaddingHorizontal / 1.5 }} />
        <Picker
          ref={municipalityPickerRef}
          selectedValue={municipality}
          onValueChange={handleMunicipalityChange}
          dropdownIconColor="#0463fcff"
          style={{ color: '#111827', flex: 1, fontSize: sizes.fontLarge }} // selected value scales
        >
          {/* Scale the first placeholder item */}
          <Picker.Item
            label="Select Municipality"
            value=""
            color="#555"
            style={{ fontSize: sizes.fontLarge }} // works on iOS
          />
          {municipalities.map((mun) => (
            <Picker.Item
              key={mun}
              label={mun}
              value={mun}
              color="#111827"
              style={{ fontSize: sizes.fontLarge }} // iOS only
            />
          ))}
        </Picker>

      </View>

      {/* Barangay Section */}
      {municipality && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(169, 172, 218, 0.87)',
            borderRadius: sizes.pickerBorderRadius,
            paddingHorizontal: sizes.pickerPaddingHorizontal,
            paddingVertical: sizes.pickerPaddingVertical,
            marginBottom: sizes.pickerMarginBottom,
            borderWidth: 2,
            borderColor: errors?.homeAddress ? 'red' : '#8d8d8dff'
          }}
        >
          <Ionicons name="location-outline" size={sizes.iconSize} color="#0a3aca" style={{ marginRight: sizes.pickerPaddingHorizontal / 1.5 }} />
          <Picker
            ref={barangayPickerRef}
            enabled={barangayList.length > 0}
            selectedValue={barangay}
            onValueChange={handleBarangayChange}
            dropdownIconColor={barangayList.length > 0 ? "#0463fcff" : "#888"}
            style={{ color: '#111827', flex: 1, fontSize: sizes.fontLarge }}
          >
            <Picker.Item
              label="Select Barangay"
              value=""
              color="#555"
              style={{ fontSize: sizes.fontLarge }}
            />
            {barangayList.map((brgy) => (
              <Picker.Item
                key={brgy}
                label={brgy}
                value={brgy}
                color="#111827"
                style={{ fontSize: sizes.fontLarge }}
              />
            ))}
          </Picker>

        </View>
      )}

      {/* Selected Address Display */}
      {municipality && barangay && (
        <View style={{
          marginTop: sizes.containerPadding,
          padding: sizes.selectedAddressPadding,
          backgroundColor: '#e0e7ff',
          borderRadius: sizes.selectedAddressBorderRadius,
          borderLeftWidth: sizes.selectedAddressBorderWidth,
          borderLeftColor: '#6366f1'
        }}>
          <Text style={{ color: '#111827', fontSize: sizes.fontSmall, marginBottom: 4 * scale, fontWeight: '500' }}>
            Selected Address:
          </Text>
          <Text style={{ color: '#111827', fontSize: sizes.fontMedium, fontWeight: '600' }}>
            {homeAddress}
          </Text>
        </View>
      )}

      {/* Error Message */}
      {errors?.homeAddress && (
        <Text style={{ color: 'red', marginTop: 6 * scale, fontSize: sizes.errorFont }}>
          {errors.homeAddress}
        </Text>
      )}
    </View>
  );
});

export default BoholAddressSelector;
