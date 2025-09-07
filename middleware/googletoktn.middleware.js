import { jwtDecode } from "jwt-decode";
import { OAuth2Client } from "google-auth-library";

export const tokendecoded = async (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const verifyGoogleToken = async (token) => {
  const client = `${process.env.GOOGLE_CLIENT_ID}`
  //console.log("verifying token with client:", client);
  const authclient = new OAuth2Client(client);
  //console.log("authclient created:", authclient);
  try {
    const ticket = await authclient.verifyIdToken({
      idToken: token,
      audience: client,
    });
    return ticket;
  } catch (error) {
    console.error("Error verifying Google token:", error);
    return null;
  }
};