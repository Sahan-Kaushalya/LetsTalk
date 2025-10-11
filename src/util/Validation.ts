export const validateFirstName = (name: string): string | null => {
    if (!name || name.trim().length === 0) {
        return "First Name is Required!";
    }

    if (name.trim().length < 2) {
        return "First Name must be at least 2 characters!";
    }

    if (name.trim().length > 45) {
        return "First Name must be less than 45 characters!";
    }

    return null;
};

export const validateLastName = (name: string): string | null => {
    if (!name || name.trim().length === 0) {
        return "Last Name is Required!";
    }

    if (name.trim().length < 2) {
        return "Last Name must be at least 2 characters!";
    }

    if (name.trim().length > 45) {
        return "Last Name must be less than 45 characters!";
    }

    return null;
};

export const validateAboutMe = (about: string): string | null => {
    if (!about || about.trim().length === 0) {
        return "About Me is Required!";
    }

    if (about.trim().length < 10) {
        return "About Me must be at least 10 characters!";
    }

    if (about.trim().length > 350) {
        return "About Me must be less than 350 characters!";
    }

    return null;
};

export const validateCountryCode = (countryCode: string): string | null => {
    const regex = /^\+[1-9]\d{0,2}$/; // + followed by 1-3 digits
    if (!countryCode) {
        return "Country Code is Required!";
    }

    if (!regex.test(countryCode)) {
        return "Enter a Valid Country Code!";
    }

    return null;
};

export const validatePhoneNo = (phoneNo: string): string | null => {
    const regex = /^[1-9]\d{6,14}$/; // 7-15 digits, no leading zero
    if (!phoneNo) {
        return "Contact Number is Required!";
    }

    if (!regex.test(phoneNo)) {
        return "Enter a Valid Contact Number!";
    }

    return null;
};


export const validateSriLankanMobile = (phoneNo: string): string | null => {
    const sriLankaRegex = /^(7{1})([0|1|2|4|5|6|7|8]{1})([0-9]{7})$/;
    
    if (!phoneNo) {
        return "Mobile Number is Required!";
    }

    if (!sriLankaRegex.test(phoneNo)) {
        return "Enter a Valid Sri Lankan Mobile Number! (e.g., 712345678)";
    }

    return null;
};


export const validatePhoneByCountry = (phoneNo: string, callingCode: string): string | null => {
    if (!phoneNo) {
        return "Contact Number is Required!";
    }

    if (callingCode === '94') {
        return validateSriLankanMobile(phoneNo);
    }

    return validatePhoneNo(phoneNo);
};

export const validateProfileImage = (image: {
    uri: string;
    type?: string;
    fileSize?: number;
} | null): string | null => {
    if (!image) {
        return "Profile Image is Required!";
    }

    if (image.type && !["image/jpeg", "image/jpg", "image/png"].includes(image.type)) {
        return "Select a Valid image type (JPEG, JPG, PNG)!";
    }

    if (image.fileSize && image.fileSize > 10 * 1024 * 1024) {
        // 10 MB
        return "Profile Image must be less than 10 MB!";
    }

    return null;
};

export const validateEmail = (email: string): string | null => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    
    if (!email || email.trim().length === 0) {
        return "Email is Required!";
    }

    if (!emailRegex.test(email)) {
        return "Enter a Valid Email Address!";
    }

    return null;
};

export const validatePassword = (password: string): string | null => {
    if (!password || password.length === 0) {
        return "Password is Required!";
    }

    if (password.length < 8) {
        return "Password must be at least 8 characters!";
    }

    if (password.length > 32) {
        return "Password must be less than 32 characters!";
    }

    // At least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter!";
    }

    // At least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter!";
    }

    // At least one number
    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number!";
    }

    // At least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return "Password must contain at least one special character!";
    }

    return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword || confirmPassword.length === 0) {
        return "Confirm Password is Required!";
    }

    if (password !== confirmPassword) {
        return "Passwords do not match!";
    }

    return null;
};

export const validateOTP = (otp: string): string | null => {
    const otpRegex = /^[0-9]{6}$/;
    
    if (!otp) {
        return "Verification Code is Required!";
    }

    if (!otpRegex.test(otp)) {
        return "Enter a Valid 6-digit Code!";
    }

    return null;
};

export const validateAge = (age: string | number): string | null => {
    const ageNum = typeof age === 'string' ? parseInt(age) : age;
    
    if (!age) {
        return "Age is Required!";
    }

    if (isNaN(ageNum)) {
        return "Enter a Valid Age!";
    }

    if (ageNum < 13) {
        return "You must be at least 13 years old!";
    }

    if (ageNum > 120) {
        return "Enter a Valid Age!";
    }

    return null;
};

export const validateUsername = (username: string): string | null => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    
    if (!username || username.trim().length === 0) {
        return "Username is Required!";
    }

    if (!usernameRegex.test(username)) {
        return "Username must be 3-20 characters (letters, numbers, _, -)!";
    }

    return null;
};