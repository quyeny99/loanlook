export const getAllowedEmails = async () => {
  try {
    const response = await fetch("/api/auth");
    const data = await response.json();
    return data.allowedEmails;
  } catch (error) {
    console.error("Failed to fetch allowed emails:", error);
    return [];
  }
};
