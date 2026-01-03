import { ChangelogInsert } from "./models.js";

export const getChangelogEntries = async function (page) {
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
        page: page,
        paginate: 20,
        order: [['releaseDate', 'DESC']]
    }
    const { docs, pages, total } = await ChangelogInsert.paginate(options);
    return { docs, pages, page };
}