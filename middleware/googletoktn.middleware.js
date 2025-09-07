import jwtDecode from 'jwt-decode';
import { OAuth2Client } from 'google-auth-library';

export const tokendecoded = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error?.message || error);
    return null;
  }
};

export const verifyGoogleToken = async (token) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error('GOOGLE_CLIENT_ID not set in environment');
    return null;
  }
  const authclient = new OAuth2Client(clientId);
  try {
    const ticket = await authclient.verifyIdToken({ idToken: token, audience: clientId });
    return ticket;
  } catch (error) {
    console.error('Error verifying Google token:', error?.message || error);
    return null;
  }
};