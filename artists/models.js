import Sequelize from 'sequelize';
import sequelizePaginate from 'sequelize-paginate';
import { sequelize } from '../database.js';
import { Track } from '../chart/models.js';

export const Performer = sequelize.define("performer", {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    techName: {
        type: Sequelize.STRING,
        allowNull: true
    },
    isBand: {
        type: Sequelize.BOOLEAN
    },
    artistImage: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: false,
    underscored: true
});

export const TrackArtistBind = sequelize.define("bind_track_artist", {
    trackId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    performerId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: false,
    underscored: true
});

Performer.belongsToMany(Track, { through: TrackArtistBind });
Track.belongsToMany(Performer, { through: TrackArtistBind });

export const Aka = sequelize.define("aka", {
    artistId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: false,
    underscored: true
});

Performer.hasMany(Aka, { as: 'aka', foreignKey: 'artistId'});
Aka.belongsTo(Performer, { as: 'performer', foreignKey: 'artistId'});

export const BandMember = sequelize.define("band_member", {
    bandId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    memberId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: false,
    underscored: true
});

Performer.hasMany(BandMember, { as: 'band_member_band', foreignKey: 'bandId'});
BandMember.belongsTo(Performer, { as: 'band_member_band', foreignKey: 'bandId'});
Performer.hasMany(BandMember, { as: 'band_member', foreignKey: 'memberId'});
BandMember.belongsTo(Performer, { as: 'performer', foreignKey: 'memberId'});

sequelizePaginate.paginate(Performer)