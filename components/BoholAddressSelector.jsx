import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
  onSubmitEditing // Add this to handle when barangay is selected
}, ref) => {
  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");
  const municipalityPickerRef = useRef(null);
  const barangayPickerRef = useRef(null);

  const municipalities = getMunicipalities();
  const barangayList = municipality ? getBarangays(municipality) : [];

  // Expose focus method to parent
  useImperativeHandle(ref, () => ({
    focus: () => {
      // Trigger the municipality picker to open
      // Note: Picker doesn't have a direct .focus() or .open() method
      // So we'll use a workaround with TouchableOpacity wrapper
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
      
      // Call onSubmitEditing when both are selected
      if (onSubmitEditing) {
        onSubmitEditing();
      }
    } else {
      setHomeAddress("");
      if (onAddressChange) {
        onAddressChange(null);
      }
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
    
    // Auto-focus barangay picker after municipality is selected
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
    <View className="mt-3">
      {/* Municipality Section */}
      <View
        className={`flex-row items-center bg-indigo-200/70 rounded-lg px-4 py-1 mb-6 border-2 ${errors?.homeAddress ? 'border-red-500' : 'border-gray-400'}`}
      >
        <Ionicons name="map-outline" size={20} color="#0a3aca" style={{ marginRight: 12 }} />
        <Picker
          ref={municipalityPickerRef}
          selectedValue={municipality}
          onValueChange={handleMunicipalityChange}
          dropdownIconColor="#487bcfff"
          style={{ color: '#111827', flex: 1 }}
        >
          <Picker.Item label="Select Municipality" value="" />
          {municipalities.map((mun) => (
            <Picker.Item key={mun} label={mun} value={mun} />
          ))}
        </Picker>
      </View>

      {/* Barangay Section */}
      {municipality ? (
        <>
          <View
            className={`flex-row items-center bg-indigo-200/70 rounded-lg px-4 py-1 mb-3 border-2 ${errors?.homeAddress ? 'border-red-500' : 'border-gray-400'}`}
          >
            <Ionicons name="location-outline" size={20} color="#0a3aca" style={{ marginRight: 12 }} />
            <Picker
              ref={barangayPickerRef}
              enabled={barangayList.length > 0}
              selectedValue={barangay}
              onValueChange={handleBarangayChange}
              dropdownIconColor={barangayList.length > 0 ? "#487bcfff" : "#888"}
              style={{ color: '#111827', flex: 1 }}
            >
              <Picker.Item label="Select Barangay" value="" />
              {barangayList.map((brgy) => (
                <Picker.Item key={brgy} label={brgy} value={brgy} />
              ))}
            </Picker>
          </View>
        </>
      ) : null}

      {/* Selected Address Display */}
      {municipality && barangay && (
        <View className="mt-4 p-3 bg-indigo-100 rounded-md border-l-4 border-l-indigo-500">
          <Text className="text-black text-xs mb-1 font-medium">Selected Address:</Text>
          <Text className="text-black text-sm font-semibold">{homeAddress}</Text>
        </View>
      )}

      {/* Error Message */}
      {errors?.homeAddress && (
        <Text className="text-red-500 mt-2 text-sm">{errors.homeAddress}</Text>
      )}
    </View>
  );
});

export default BoholAddressSelector;