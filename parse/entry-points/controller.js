import { getChartMaxDate } from "../../chart/requests.js";
import { parsePosts } from "../vk-requests.js";

export const ParseController = new class {
    getParse = async function (req, res) {
        try {
            const post = parseInt(req.query['post']);
            let max_date_next = new Date(await getChartMaxDate());
            max_date_next.setDate(max_date_next.getDate() + 1);
            const date_str = max_date_next.toISOString().split('T')[0];

            if (post === null || isNaN(post)) {
                return res.render('parse', {
                    values: [],
                    date: date_str,
                    post: 0
                });
            }
            
            try {
                const values = await parsePosts(post);
                res.render('parse', {
                    values: values,
                    date: date_str,
                    post: post
                });
            }
            catch (e) { res.render('404'); }
        }
        catch (e) { res.render('500'); }
    };
};

export default ParseController;