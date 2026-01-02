export const getArtistStats = function (tracks) {
    let no1_amount = 0;
    let top3_amount = 0;
    let full_len = 0;
    tracks.forEach(track => {
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

    return { no1_amount, top3_amount, full_len };
}