import { insertParsedChart } from "../requests.js";

export const ParseAPIController = new class {
    doParse = async function (req, res) {
        const data_set = await insertParsedChart(req.body.data, req.body.date);
        res.status(data_set[0]).send(data_set[1]);
    }   
};

export default ParseAPIController;