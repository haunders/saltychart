import { getChartByDate, getChartOutsByDate, getChartMaxDate } from "../requests.js";

export const ChartController = new class {
    getChart = async function (req, res) {
        const todayDate = new Date(
            +req.params.year,
            +req.params.month - 1,
            +req.params.day + 1
        )
        const prevDate = new Date(
            +req.params.year,
            +req.params.month - 1,
            +req.params.day
        )
        const max_date = await getChartMaxDate();
        const max_date_compare = new Date(max_date);
        const min_date_compare = new Date("2021-01-18");
        if (prevDate <= max_date_compare && todayDate >= min_date_compare) {
            const date_string = todayDate.toISOString().split('T')[0]
            const date_string_yesterday = prevDate.toISOString().split('T')[0]

            const result = await getChartByDate(date_string, date_string_yesterday);
            const result_out = await getChartOutsByDate(date_string, date_string_yesterday);

            res.render('chart-page', {
                data: result,
                date: prevDate,
                date_string: date_string,
                data_out: result_out,
                max_date: max_date
            });
        }
        else {
            res.status(404).render('404');
        }
    };

    getLastChart = async function (req, res) {
        const max_date = await getChartMaxDate();
        res.redirect('/chart/' + max_date);
    };
};

export default ChartController;