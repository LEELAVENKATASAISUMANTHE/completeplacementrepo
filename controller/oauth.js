import axios from 'axios';
import { userbyemail, createUsers } from '../db/user.db.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { tokendecoded, verifyGoogleToken } from '../middleware/googletoktn.middleware.js';
export const  oauthConsent = asyncHandler((req, res) => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&` +
        `response_type=code&` +
        `scope=https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile&` +
        `access_type=offline&` +
        `prompt=consent`;
  res.status(200).json({ url: authUrl });
});

export const oauthCallback = asyncHandler(async (req, res) => {
    const { code } =req.query;
    if(!code){
        return res.status(400).send("Authorization code not provided");
    }

    try{
        const params = new URLSearchParams();
            params.append('client_id', process.env.GOOGLE_CLIENT_ID);
            params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
            params.append('code', code);
            params.append('redirect_uri', process.env.GOOGLE_CALLBACK_URL);
            params.append('grant_type', 'authorization_code');

const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', params.toString(), {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
});

        const { access_token, id_token,refresh_token } = tokenResponse.data;

        const userinfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
           let dbUser;
        const verifiedToken = await verifyGoogleToken(id_token);
        const payload = verifiedToken.getPayload();
            console.log("Google OAuth payload:", payload);
        if (payload.email_verified === true) {
            console.log("Email is verified:", payload.email);
            console.log(1);
            try {
                 const result = await userbyemail(payload.email);
            console.log("User lookup result:", result);
          
            if (result) {
                console.log("User exists in DB:", result);
                dbUser = result;
            }
            } catch (error) {
                console.error("Error fetching user by email:", error);
            }       
        }
        req.session.user = {
            name: payload.name,
            email: payload.email,
            role_id: dbUser ? dbUser.role_id : null,
            id: dbUser ? dbUser.id : null
        }
        console.log("User logged in:", req.session.user);
        return res.redirect(("http://localhost:5173/dashboard"));

    }catch(error){
        console.error("Error exchanging authorization code for access token",error.message);
        return res.status(500).send("Internal Server Error");
    }
});

export const logout = asyncHandler((req, res) => {
    req.session.destroy();
    res.redirect("/");
});

export const getUserData = asyncHandler((req, res) => {
    if (req.session.user) {
        return res.status(200).json({
            status: "success",
            route: req.originalUrl,
            data: req.session.user,
            error: null
        });
    } else {
        return res.status(401).json({
            status: "error",
            route: req.originalUrl,
            data: null,
            error: "Not authenticated"
        });
    }
});