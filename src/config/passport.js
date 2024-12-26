import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js"; // Assuming you have a User model
import { googleCallbackUrl, googleClientId, googleClientSecretId } from "./envconfig.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: googleClientId,
            clientSecret: googleClientSecretId,
            callbackURL: googleCallbackUrl,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log('accessToken :>> ', accessToken);
                // Check if user already exists in the database
                let user = await User.findOne({ googleId: profile.id });
                if (!user) {
                    // If user does not exist, create a new one
                    user = await User.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                    });
                }
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

// Serialize user
passport.serializeUser((user, done) => {
    console.log('user :>> ', user);
    done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
    try {
        console.log("Deserializing user with ID:", id);
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
