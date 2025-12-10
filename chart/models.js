import Sequelize from 'sequelize';
import { sequelize } from '../database.js';

export const ChartMainPosition = sequelize.define("positions", {
    chartDate: {
        type: Sequelize.DATE,
        allowNull: true
    },
    trackPosition: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    trackId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: false,
    underscored: true
});

export const Track = sequelize.define("track", {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    performer: {
        type: Sequelize.STRING,
        allowNull: true
    },
    chartYear: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    displayTitle: {
        type: Sequelize.STRING,
        allowNull: true
    },
    displayPerformer: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: false,
    underscored: true
});

Track.hasMany(ChartMainPosition, { as: 'positions', foreignKey: 'trackId'});
ChartMainPosition.belongsTo(Track, { as: 'track', foreignKey: 'trackId'});