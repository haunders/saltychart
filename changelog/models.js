import Sequelize from 'sequelize';
import { sequelize } from '../database.js';

export const ChangelogInsert = sequelize.define("changelog", {
    text: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    version: {
        type: Sequelize.STRING,
        allowNull: true
    },
    releaseDate: {
        type: Sequelize.DATE,
        allowNull: true
    },
    phaze: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: false,
    underscored: true
});