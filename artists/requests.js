import { QueryTypes } from 'sequelize';
import { sequelize } from '../database.js';
import { Performer } from "./models.js";

export const getArtistPagination = async function (page, order) {
    if (page == undefined) {
        page = 1;
    }
    else {
        try {
            page = parseInt(page);
        }
        catch (e) {
            return res.status(403).send("Page is unacceptable")
        }
    }
        
    let options = {
        attributes: ['title', 'tech_name'],
        page: page,
        paginate: 20
    }
    if (order === "alphabet") {
        options.order = [['title', 'ASC']];
    }
    else {
        options.order = [['id', 'DESC']];
    }
    const { docs, pages, total } = await Performer.paginate(options);
    return { docs, pages, page, order}
}

export const getArtistByTech = async function (tech_name) {
    return Performer.findOne({
        raw: true,
        where: { tech_name: tech_name }
    });
}

export const getArtistTracks = async function (tech_name) {
    return sequelize.query(`select tr.title, tr.performer, tr.display_title, tr.display_performer,
        count(p.id) as days, min(p.track_position) as peak,
        nullif(count(p.id) filter(where p.track_position = 1), 0) as days_at_1,
        min(p.chart_date) as debut,
        coalesce(sum(21 - p.track_position),0) as points,
        (select p2.chart_date from positions p2
        where p2.track_id = tr.id
        order by p2.track_position, p2.chart_date
        limit 1) as peak_date
        from track tr
        left join positions p on p.track_id = tr.id
        left join bind_track_artist bta on bta.track_id = tr.id
        left join performer perf on bta.performer_id = perf.id
        where perf.tech_name = :tech_name
        group by tr.id
        order by points desc;`,
        {
            replacements: {
                tech_name: tech_name
            },
            type: QueryTypes.SELECT,
        });
}

export const getArtistAka = async function (id) {
    return sequelize.query(`select title
        from aka
        where artist_id = :artist_id_replacement;`,
        {
            replacements: {
                artist_id_replacement: id
            },
            type: QueryTypes.SELECT,
        });
}

export const getArtistMembers = async function (tech_name) {
    return sequelize.query(`select p2.title as band_title, p2.tech_name as band_tech from band_member bm 
        left join performer p1 on p1.id = bm.band_id
        left join performer p2 on p2.id = bm.member_id
        where p1.tech_name = :tech_name;`,
            {
                replacements: {
                    tech_name: tech_name
                },
                type: QueryTypes.SELECT,
            });
}

export const getArtistBands = async function (tech_name) {
    return sequelize.query(`select p1.title as band_title, p1.tech_name as band_tech from band_member bm 
        left join performer p1 on p1.id = bm.band_id
        left join performer p2 on p2.id = bm.member_id
        where p2.tech_name = :tech_name;`,
            {
                replacements: {
                    tech_name: tech_name
                },
                type: QueryTypes.SELECT,
            });
}