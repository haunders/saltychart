import express from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../database.js';
import { Performer } from "./models.js";
import { User } from "../auth/models.js";
import { requiresAuthentication, requiresAdmin } from "../auth/controller.js";

export const artistRouter = express.Router();
artistRouter.get("/:tech_name", requiresAuthentication, async (req, res) => {
    const artist = await Performer.findOne({
        raw: true,
        where: { tech_name: req.params.tech_name }
    });
    if ( artist ) {
        const result = await sequelize.query(`select tr.title, tr.performer, tr.display_title, tr.display_performer,
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
        if (artist.isBand) {
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

artistRouter.get("/", requiresAuthentication, async (req, res) => {
    const sort = req.query['sort'];
    let page = req.query.page;

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
    if (sort === "alphabet") {
        options.order = [['title', 'ASC']];
    }
    else {
        options.order = [['id', 'DESC']];
    }
    const { docs, pages, total } = await Performer.paginate(options);

    res.render('artists-hub', {
        artists_new: docs,
        artists_pages_new: pages,
        page: page,
        sort: sort
    });
});

export default artistRouter;