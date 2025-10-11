import { useContext } from "react";
import { UserRegistrationData } from "../components/UserContext";


const API = process.env.EXPO_PUBLIC_APP_URL + "/LetsTalk";

export const createNewAccount = async (
  userRegistrationData: UserRegistrationData
) => {
  let formData = new FormData();
  formData.append("firstName", userRegistrationData.firstName);
  formData.append("lastName", userRegistrationData.lastName);
  formData.append("aboutMe", userRegistrationData.aboutMe);
  formData.append("countryCode", '+'+userRegistrationData.countryCode);
  formData.append("contactNo", userRegistrationData.contactNo);
  formData.append("profileImage", {
    uri: userRegistrationData.profileImage,
    name: "profile.png",
    type: "image/png",
  } as any);

  const response = await fetch(API + "/UserController", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    const json = await response.json();
    return json;
  } else {
    return "OOPS! Account creation failed!";
  }
};

export const updateProfile = async (
  userId: string,
  firstName: string,
  lastName: string,
  aboutMe: string,
  imageUri: string
) => {
  let formData = new FormData();
  
  formData.append("userId", userId);
  formData.append("firstName", firstName);
  formData.append("lastName", lastName);
  formData.append("aboutMe", aboutMe);
    formData.append("profileImage", {
      uri: imageUri,
      type: "image/jpeg", 
      name: "profile.jpg",
    } as any);
  

  try {
    const response = await fetch(API + "/ProfileUpdateController", {
      method: "POST",
      body: formData,
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorText = await response.text();
      console.warn("Profile Updating failed!", errorText);
      throw new Error("Profile update failed");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};