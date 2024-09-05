// @ts-check
/// <reference types="./demo.d.ts" />
/// <reference path="../packages/default/dist/index.d.ts" />

const $ = (id) => document.getElementById(id);
/**  @returns {HTMLElement[]} */
// @ts-expect-error
const dqa = (s) => [...document.querySelectorAll(s)];

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds / 60) % 60;
    const s = Math.floor(seconds % 60);
    return [h, m, s]
        .map((v) => (v < 10 ? '0' + v : '' + v))
        .filter((v, i) => i !== 0 || v !== '00')
        .join(':');
}

/** @type {HTMLVideoElement} */
// @ts-expect-error
const video = $('video');
const player = $('player');

(() => {
    player.style.maxWidth = document.body.clientWidth + 'px';

    video.oncanplay = () => {
        $('time-duration').innerText = formatTime(video.duration);
        $('time-current').innerText = formatTime(video.currentTime);
    };

    new ResizeObserver(() => {
        $('ctrl-player-size').innerText =
            player.clientWidth + 'x' + player.clientHeight;
    }).observe(player);
    $('ctrl-player-size').onclick = () => {
        player.style.width = 'auto';
        player.style.height = 'auto';
    };

    $('ctrl-rest-player').onclick = () => {
        video.pause();
        video.currentTime = 0;
    };

    /** @type {HTMLInputElement} */
    // @ts-expect-error
    const progress = $('ctrl-progress');
    progress.onchange = () => {
        progress.dataset['inputting'] = 'false';
        video.currentTime = video.duration * progress.valueAsNumber;
    };
    progress.oninput = () => (progress.dataset['inputting'] = 'true');

    video.addEventListener('timeupdate', () => {
        $('time-current').innerText = formatTime(video.currentTime);
        if (progress.dataset['inputting'] !== 'true') {
            const v = video.currentTime / video.duration;
            progress.valueAsNumber = v ? v : 0;
        }
    });

    $('ctrl-play').onclick = () => video.play();
    $('ctrl-pause').onclick = () => video.pause();
})();

(() => {
    const biliXmlParser = new CCL.BilibiliXmlParser();
    const loadXmlDanmaku = async (url) => {
        const text = await fetch(url).then((r) => r.text());
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');
        return biliXmlParser.parseMany(xml);
    };

    const CM = new CCL.CommentManager($('danmaku-stage'));
    window.CM = CM;
    CM.init();
    CM.bindToVideo(video);

    const clearAll = () => {
        CM.load([]);
        CM.clear();
        CM.time(0);
    };

    const loadDanmaku = async (/** @type {string}*/ url) => {
        video.pause();
        video.currentTime = 0;
        clearAll();
        if (url.endsWith('xml')) {
            const list = await loadXmlDanmaku(url);
            CM.load(list);
            video.play();
        }
    };

    for (const btn of dqa('#danmaku-tests > button')) {
        if (btn.dataset['danmaku']) {
            btn.onclick = () => {
                loadDanmaku('assets/danmaku/' + btn.dataset['danmaku']);
            };
        }
    }

    $('ctrl-clear-danmaku').onclick = () => clearAll();
})();
