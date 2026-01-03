import { getChangelogEntries } from "../requests.js";

export const ChangelogController = new class {
    getChangelog = async function (req, res) {
        try {
            const { docs, pages, page } = await getChangelogEntries(req.query.page);
            if (page <= pages) {
                res.render('changelog', {
                    changelog: docs
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

export default ChangelogController;