import express from 'express';
import { QueryTypes } from 'sequelize';
import { knex_db, sequelize } from '../database.js';
import { Performer } from "./models.js";

export const artistRouter = express.Router();
artistRouter.get("/:tech_name", async(req, res) => {
    const artist = await Performer.findOne({ 
            raw: true,
            where: { tech_name: req.params.tech_name }
        });
    if (artist != "") {
        const result = await sequelize.query(`select tr.title, tr.performer, tr.display_title, tr.display_performer,
            count(p.id) as days, min(p.track_position) as peak,
            nullif(count(p.id) filter(where p.track_position = 1), 0) as days_at_1,
            to_char(min(p.chart_date) :: date, 'dd.mm.yyyy') as debut,
            coalesce(sum(21 - p.track_position),0) as points
            from track tr
            left join positions p on p.track_id = tr.id
            left join bind_track_artist bta on bta.track_id = tr.id
            left join performer perf on bta.performer_id = perf.id
            where perf.tech_name = :tech_name
            group by tr.id
            order by points desc;`,
            {
                replacements: {
                    tech_name: req.params.tech_name
                },
                type: QueryTypes.SELECT,
            });

        let no1_amount = 0;
        let top3_amount = 0;
        let full_len = 0;
        result.forEach(track => {
            if (track.peak > 0) {
                if (track.peak <= 3) {
                    if (track.peak == 1) {
                        no1_amount += 1;
                    }
                    top3_amount += 1;
                }
                full_len += 1;
            }
        });
        const aka_raw = await sequelize.query(`select title
            from aka
            where artist_id = :artist_id_replacement;`,
            {
                replacements: {
                    artist_id_replacement: artist.id
                },
                type: QueryTypes.SELECT,
            });
        let band_link = null;
        if (artist.is_band) {
            band_link = await sequelize.query(`select p2.title as band_title, p2.tech_name as band_tech from band_member bm 
            left join performer p1 on p1.id = bm.band_id
            left join performer p2 on p2.id = bm.member_id
            where p1.tech_name = :tech_name;`,
            {
                replacements: {
                    tech_name: req.params.tech_name
                },
                type: QueryTypes.SELECT,
            });
        }
        else {
            band_link = await sequelize.query(`select p1.title as band_title, p1.tech_name as band_tech from band_member bm 
            left join performer p1 on p1.id = bm.band_id
            left join performer p2 on p2.id = bm.member_id
            where p2.tech_name = :tech_name;`,
            {
                replacements: {
                    tech_name: req.params.tech_name
                },
                type: QueryTypes.SELECT,
            });
        }
        res.render('artist-page', {
            artist: artist,
            no1_amount: no1_amount,
            top3_amount: top3_amount,
            full_len: full_len,
            tracks: result,
            band_link: band_link,
            aka_raw: aka_raw
        });
    }
    else {
        res.status(404).send("I don't know her");
    }
});

artistRouter.get("/", async(req, res) => {
    const sort = req.query['sort'];
    const page = req.query.page;
    let knex_db_link = knex_db("performer")
    if (sort == "alphabet") {
        knex_db_link = knex_db_link.orderBy("title", "asc")
    }
    else {
        knex_db_link = knex_db_link.orderBy("id", "desc")
    }
    const results = await knex_db_link.paginate({
        perPage: 20,
        currentPage: page,
        isLengthAware: true
    }, )
    res.render('artists-hub', {
        artists: results.data,
        artists_pages: results.pagination,
        sort: sort
    });
});

export default artistRouter;