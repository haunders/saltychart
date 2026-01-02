import { vk } from '../vk-api.js';

export const parsePosts = async function (post) {
    const data = await vk.call('wall.get', {
        domain: 'saltychart'
    });
    let position = 0;
    let rest_track = '';
    let track_title = '';
    let pref_title = '';
    let regex = new RegExp('[()]');

    let values = [];
    data.items[post - 1].text.split('\n').forEach((e, i) => {
        if ((i > 1 && i < 24) && (e.length > 10)) {
            position = e.split('. ')[0]
            rest_track = e.split('. ').slice(1).join('. ')
            rest_track = rest_track.split('] ').slice(1).join('] ')
            track_title = rest_track.split(' - ')[0].trim()
            pref_title = rest_track.split(' - ')[1]
            pref_title = pref_title.split(regex)[0].trim()
            values.push([position, track_title, pref_title]);
        }
    });

    return values
}