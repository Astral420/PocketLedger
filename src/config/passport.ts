import passport from 'passport';
import { Strategy } from 'passport-google-oauth20';
import { getOAuthAccount, createOAuthAccount } from '../models/oauth.model';
import { getUserByEmail, createOAuthUser, updateUserImage } from '../models/user.model';


export function setupPassport() {
    passport.use(
        new Strategy({
            clientID: process.env.GOOGLE_CLIENT_ID! as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET! as string,
            callbackURL: process.env.GOOGLE_CALLBACK_URL! as string,
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const provider = "google" as const;
                const providerUserID = profile.id;
                const email = profile.emails?.[0]?.value ?? null;
                const displayName = profile.displayName ?? null;
                const avatarUrl = profile.photos?.[0]?.value ?? null;

                if (!email) {
                    return done(new Error("Google account did not return an email address"), false);
                }

                const existingLink = await getOAuthAccount(provider, providerUserID);
                
                let userId: string;

                if(existingLink){
                    userId = existingLink.user_id;
                    if (avatarUrl) await updateUserImage(userId, avatarUrl);

                } else {
                    const existingUser = email ? await getUserByEmail(email) : null;
                    if(existingUser){
                        userId = existingUser.id;

                    } else {
                        const newUser = await createOAuthUser(displayName, email , avatarUrl);
                        userId = newUser.id;
                    }
                        await createOAuthAccount({
                            userID: userId,
                            provider,
                            providerUserID,
                            email,
                        });
                }
                return done (null, {userId});
            } catch (error) {
                return done(error as any, false);
            }
        }
    )
    )
    
}
