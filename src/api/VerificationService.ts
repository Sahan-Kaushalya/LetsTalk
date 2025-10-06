const API = process.env.EXPO_PUBLIC_APP_URL + "/LetsTalk";

export const verifyMobile = async (mobile: string, countryCode: string) => {
    const mobileData = {
        mobile: mobile,
        countryCode: "+" + countryCode,
    };

    try {
        const response = await fetch(API + "/MobileVerification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(mobileData),
        });


        if (response.ok) {
            const json = await response.json();
            return json;
        } else {
            return "OOPS! Mobile Verification failed!";
        }
    } catch (error) {
        console.error("Error verifying mobile:", error);
        throw error;
    }
};
