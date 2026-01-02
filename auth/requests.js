import { User } from "./models.js";

export const getUser = async function (email) {
    return User.findOne({ where: { email: email } });
}

export const updateUser = async function (user_data) {
    return User.update(
        {
            name: user_data.displayName,
            googleId: user_data.id,
            avatar: user_data.photos[0].value
        },
        { where: { email: user_data.emails[0].value } }
    );    
}