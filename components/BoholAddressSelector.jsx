import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { View, Text, useWindowDimensions, TextInput, Pressable, ScrollView } from "react-native";
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
  setErrors,
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
  const [showMunicipalityList, setShowMunicipalityList] = useState(false);
  const [showBarangayList, setShowBarangayList] = useState(false);
  const municipalityInputRef = useRef(null);
  const barangayInputRef = useRef(null);

  const municipalities = getMunicipalities();
  const normalizedMunicipality = municipality.trim().toLowerCase();
  const matchedMunicipality =
    municipalities.find((mun) => mun.toLowerCase() === normalizedMunicipality) || "";
  const barangayList = matchedMunicipality ? getBarangays(matchedMunicipality) : [];
  const normalizedBarangay = barangay.trim().toLowerCase();
  const matchedBarangay =
    barangayList.find((brgy) => brgy.toLowerCase() === normalizedBarangay) || "";
  const filteredMunicipalities = normalizedMunicipality
    ? municipalities.filter((mun) =>
        mun.toLowerCase().includes(normalizedMunicipality)
      )
    : municipalities;
  const filteredBarangays = normalizedBarangay
    ? barangayList.filter((brgy) =>
        brgy.toLowerCase().includes(normalizedBarangay)
      )
    : barangayList;
  const isSingleMunicipality = filteredMunicipalities.length === 1;
  const isSingleBarangay = filteredBarangays.length === 1;

  // Expose focus method to parent
  useImperativeHandle(ref, () => ({
    focus: () => {
      setShowMunicipalityList(true);
      municipalityInputRef.current?.focus?.();
    }
  }));

  useEffect(() => {
    if (onAddressPartsChange) {
      onAddressPartsChange({ municipality: matchedMunicipality, barangay: matchedBarangay });
    }

    if (matchedMunicipality && matchedBarangay) {
      const fullAddress = `${matchedBarangay}, ${matchedMunicipality}, Bohol`;
      setHomeAddress(fullAddress);

      if (onAddressChange) {
        const dbFormat = formatAddressForDB(matchedMunicipality, matchedBarangay);
        onAddressChange(dbFormat);
      }

      if (onSubmitEditing) onSubmitEditing();
    } else {
      setHomeAddress("");
      if (onAddressChange) onAddressChange(null);
    }
  }, [matchedMunicipality, matchedBarangay]);

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

  const clearHomeAddressError = () => {
    if (setErrors && errors?.homeAddress) {
      setErrors((prev) => ({ ...prev, homeAddress: false }));
    }
  };

  const selectMunicipality = (value) => {
    setMunicipality(value);
    setBarangay("");
    setShowMunicipalityList(false);
    setShowBarangayList(false);
    clearHomeAddressError();

    if (value) {
      setTimeout(() => {
        barangayInputRef.current?.focus?.();
        setShowBarangayList(true);
      }, 150);
    }
  };

  const selectBarangay = (value) => {
    setBarangay(value);
    setShowBarangayList(false);
    clearHomeAddressError();
  };

  const handleMunicipalitySubmit = () => {
    const match = municipalities.find(
      (mun) => mun.toLowerCase() === municipality.trim().toLowerCase()
    );
    if (match) {
      selectMunicipality(match);
    } else if (filteredMunicipalities.length > 0) {
      selectMunicipality(filteredMunicipalities[0]);
    } else {
      setShowMunicipalityList(true);
    }
  };

  const handleBarangaySubmit = () => {
    if (!matchedMunicipality) {
      setShowMunicipalityList(true);
      municipalityInputRef.current?.focus?.();
      return;
    }

    const match = barangayList.find(
      (brgy) => brgy.toLowerCase() === barangay.trim().toLowerCase()
    );
    if (match) {
      selectBarangay(match);
    } else if (filteredBarangays.length > 0) {
      selectBarangay(filteredBarangays[0]);
    } else {
      setShowBarangayList(true);
    }
  };

  return (
    <View style={{ marginTop: sizes.containerPadding }}>
      {/* Municipality Section */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(199,210,254,0.7)',
          borderRadius: 14 * scale,
          paddingHorizontal: 14 * scale,
          paddingVertical: 8 * scale,
          marginBottom: sizes.pickerMarginBottom,
          borderWidth: 2,
          borderColor: errors?.homeAddress ? '#ef4444' : '#6d4bd9'
        }}
      >
        <Ionicons name="map-outline" size={sizes.iconSize} color="#0a3aca" style={{ marginRight: 10 * scale }} />
        <TextInput
          ref={municipalityInputRef}
          placeholder="Select Municipality"
          placeholderTextColor="#555"
          value={municipality}
          onChangeText={(text) => {
            setMunicipality(text);
            if (barangay) setBarangay("");
            setShowMunicipalityList(true);
          }}
          onFocus={() => setShowMunicipalityList(true)}
          onBlur={() => setTimeout(() => setShowMunicipalityList(false), 120)}
          onSubmitEditing={handleMunicipalitySubmit}
          returnKeyType="next"
          style={{ color: '#1f2937', flex: 1, fontSize: sizes.fontLarge, paddingVertical: 4 * scale, paddingRight: 6 * scale }}
        />
        <Ionicons name="chevron-down" size={sizes.iconSize} color="#5b21b6" />

      </View>

      {showMunicipalityList && filteredMunicipalities.length > 0 && (
        <View
          style={{
            backgroundColor: 'rgba(199,210,254,0.7)',
            borderWidth: 1,
            borderColor: '#6d4bd9',
            borderRadius: (isSingleMunicipality ? 14 : 12) * scale,
            marginTop: 4 * scale,
            marginBottom: sizes.pickerMarginBottom,
            maxHeight: isSingleMunicipality ? 80 * scale : 200 * scale,
            overflow: 'hidden',
            paddingVertical: isSingleMunicipality ? 6 * scale : 0,
          }}
        >
          <ScrollView nestedScrollEnabled>
            {filteredMunicipalities.map((mun, idx) => (
              <Pressable
                key={mun}
                onPress={() => selectMunicipality(mun)}
                style={({ pressed }) => ({
                  paddingVertical: (isSingleMunicipality ? 12 : 10) * scale,
                  paddingHorizontal: (isSingleMunicipality ? 18 : 16) * scale,
                  backgroundColor: pressed ? 'rgba(199,210,254,0.9)' : 'transparent',
                  borderTopWidth: idx === 0 ? 0 : 1,
                  borderTopColor: '#e2d7fb',
                  borderRadius: isSingleMunicipality ? 10 * scale : 0,
                  marginHorizontal: isSingleMunicipality ? 8 * scale : 0,
                })}
              >
                <Text style={{ color: '#2e1065', fontSize: sizes.fontLarge, paddingLeft: 8 * scale }}>
                  {mun}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Barangay Section */}
      {matchedMunicipality && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(199,210,254,0.7)',
            borderRadius: 14 * scale,
            paddingHorizontal: 14 * scale,
            paddingVertical: 8 * scale,
            marginBottom: sizes.pickerMarginBottom,
            borderWidth: 2,
            borderColor: errors?.homeAddress ? '#ef4444' : '#6d4bd9'
          }}
        >
          <Ionicons name="location-outline" size={sizes.iconSize} color="#0a3aca" style={{ marginRight: 10 * scale }} />
          <TextInput
            ref={barangayInputRef}
            placeholder="Select Barangay"
            placeholderTextColor="#555"
            value={barangay}
            onChangeText={(text) => {
              setBarangay(text);
              setShowBarangayList(true);
            }}
            onFocus={() => setShowBarangayList(true)}
            onBlur={() => setTimeout(() => setShowBarangayList(false), 120)}
            onSubmitEditing={handleBarangaySubmit}
            returnKeyType="done"
            style={{ color: '#1f2937', flex: 1, fontSize: sizes.fontLarge, paddingVertical: 4 * scale, paddingRight: 6 * scale }}
          />
          <Ionicons name="chevron-down" size={sizes.iconSize} color="#5b21b6" />

        </View>
      )}

      {matchedMunicipality && showBarangayList && filteredBarangays.length > 0 && (
        <View
          style={{
            backgroundColor: 'rgba(199,210,254,0.7)',
            borderWidth: 1,
            borderColor: '#6d4bd9',
            borderRadius: (isSingleBarangay ? 14 : 12) * scale,
            marginTop: 4 * scale,
            marginBottom: sizes.pickerMarginBottom,
            maxHeight: isSingleBarangay ? 80 * scale : 200 * scale,
            overflow: 'hidden',
            paddingVertical: isSingleBarangay ? 6 * scale : 0,
          }}
        >
          <ScrollView nestedScrollEnabled>
            {filteredBarangays.map((brgy, idx) => (
              <Pressable
                key={brgy}
                onPress={() => selectBarangay(brgy)}
                style={({ pressed }) => ({
                  paddingVertical: (isSingleBarangay ? 12 : 10) * scale,
                  paddingHorizontal: (isSingleBarangay ? 18 : 16) * scale,
                  backgroundColor: pressed ? 'rgba(199,210,254,0.9)' : 'transparent',
                  borderTopWidth: idx === 0 ? 0 : 1,
                  borderTopColor: '#e2d7fb',
                  borderRadius: isSingleBarangay ? 10 * scale : 0,
                  marginHorizontal: isSingleBarangay ? 8 * scale : 0,
                })}
              >
                <Text style={{ color: '#2e1065', fontSize: sizes.fontLarge, paddingLeft: 8 * scale }}>
                  {brgy}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Selected Address Display */}
      {matchedMunicipality && matchedBarangay && (
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
