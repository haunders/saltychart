import { getArtistPagination, getArtistByTech, getArtistTracks, getArtistAka, getArtistMembers, getArtistBands } from "../requests.js";
import { getArtistStats } from "../utils.js";

export const ArtistController = new class {
    getArtist = async function (req, res) {
        const artist = await getArtistByTech(req.params.tech_name);
        if ( artist ) {
            const tracks = await getArtistTracks(req.params.tech_name);
            const stats = getArtistStats(tracks);
            const aka_raw = await getArtistAka(artist.id);
            let band_link = null;
            if (artist.isBand) {
                band_link = await getArtistMembers(req.params.tech_name);
            }
            else {
                band_link = await getArtistBands(req.params.tech_name);
            }
            res.render('artist-page', {
                artist: artist,
                stats: stats,
                tracks: tracks,
                band_link: band_link,
                aka_raw: aka_raw
            });
        }
        else {
            res.status(404).render('404');
        }
    }

    getArtistHub = async function (req, res) {
        try {
            const { docs, pages, page, order} = await getArtistPagination(req.query.page, req.query.sort);
            if (page <= pages) {
                res.render('artists-hub', {
                    artists_new: docs,
                    artists_pages_new: pages,
                    page: page,
                    sort: order
                });
            }
            else {
                res.status(404).render('404');
            }
        }
        catch (e) {
            res.status(404).render('404');
        }
    }
};

export default ArtistController;