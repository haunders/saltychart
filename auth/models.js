import Sequelize from 'sequelize';
import { sequelize } from '../database.js';

export const User = sequelize.define("users", {
    name: {
        type: Sequelize.STRING,
        allowNull: true
    },
    googleId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    isAdmin: {
        type: Sequelize.BOOLEAN
    },
    avatar: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: false,
    underscored: true
});