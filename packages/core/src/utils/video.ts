export function calcVideoRenderedSize(
    video: HTMLVideoElement
): [number, number] {
    const rect = video.getBoundingClientRect();
    const cW = rect.width;
    const cH = rect.height;
    const cR = cW / cH;

    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const vR = vW / vH;

    let w = cW;
    let h = cH;

    if (cR > vR) {
        w = cH * vR;
    } else {
        h = cW / vR;
    }

    return [w, h];
}
