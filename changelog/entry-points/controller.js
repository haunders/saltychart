import { getChangelogEntries } from "../requests.js";

export const ChangelogController = new class {
    getChangelog = async function (req, res) {
        const docs = await getChangelogEntries(req.query.page);
        res.render('changelog', {
            changelog: docs
        });
    }
};

export default ChangelogController;