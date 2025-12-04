import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from '@expo/vector-icons';
import { 
  getMunicipalities,
  getBarangays,
  formatAddressForDB
} from "../data/boholAddressData";export default function BoholAddressSelector({ 
  homeAddress, 
  setHomeAddress, 
  errors,
  onAddressChange, // Optional callback that receives formatted DB object
  onAddressPartsChange // Add this prop
}) {
  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");

  const municipalities = getMunicipalities();
  const barangayList = municipality ? getBarangays(municipality) : [];

  // Update address whenever municipality or barangay changes
  useEffect(() => {
    // Inform parent of parts
    if (onAddressPartsChange) onAddressPartsChange({ municipality, barangay });

    if (municipality && barangay) {
      const fullAddress = `${barangay}, ${municipality}, Bohol`;
      setHomeAddress(fullAddress);

      // If callback provided, send formatted DB object
      if (onAddressPartsChange) onAddressPartsChange({ municipality, barangay });
      if (onAddressChange) {
        const dbFormat = formatAddressForDB(municipality, barangay);
        onAddressChange(dbFormat);
      }
    } else {
      setHomeAddress("");
      if (onAddressChange) {
        onAddressChange(null);
      }
    }
  }, [municipality, barangay]);

  // Parse existing address if provided (for editing)
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
    setBarangay(""); // Reset barangay when municipality changes
  };

  const handleBarangayChange = (value) => {
    setBarangay(value);
  };

  return (
    <View className="mt-3">
      {/* Municipality Section */}
      {/* <Text className="text-white mb-2 font-semibold text-sm">Municipality / City</Text> */}
      <View
        className={`flex-row items-center bg-indigo-200/70 rounded-lg px-4 py-1 mb-6 border-2 ${errors?.homeAddress ? 'border-red-500' : 'border-gray-400'}`}
      >
        <Ionicons name="map-outline" size={20} color="#0a3aca" style={{ marginRight: 12 }} />
        <Picker
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

      {/* Barangay Section: only show after a municipality is selected */}
      {municipality ? (
        <>
          {/* <Text className="text-white mb-2 font-semibold text-sm mt-4">Barangay</Text> */}
          <View
            className={`flex-row items-center bg-indigo-200/70 rounded-lg px-4 py-1 mb-3 border-2 ${errors?.homeAddress ? 'border-red-500' : 'border-gray-400'}`}
          >
            <Ionicons name="location-outline" size={20} color="#0a3aca" style={{ marginRight: 12 }} />
            <Picker
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
}


/* 
USAGE EXAMPLE:

import BoholAddressSelector from './BoholAddressSelector';
import { formatAddressForDB } from './boholAddressData';

function YourComponent() {
  const [homeAddress, setHomeAddress] = useState("");
  const [addressData, setAddressData] = useState(null);
  const [errors, setErrors] = useState({});

  const handleAddressChange = (dbFormat) => {
    setAddressData(dbFormat);
    console.log("Address for DB:", dbFormat);
    // dbFormat structure:
    // {
    //   barangay: "Bool",
    //   municipality: "Tagbilaran City",
    //   province: "Bohol",
    //   fullAddress: "Bool, Tagbilaran City, Bohol",
    //   country: "Philippines"
    // }
  };

  const handleSubmit = async () => {
    if (!addressData) {
      setErrors({ homeAddress: "Please select your complete address" });
      return;
    }

    // Save to database
    await saveToDatabase({
      ...otherUserData,
      address: addressData
    });
  };

  return (
    <BoholAddressSelector
      homeAddress={homeAddress}
      setHomeAddress={setHomeAddress}
      errors={errors}
      onAddressChange={handleAddressChange}
    />
  );
}
*/