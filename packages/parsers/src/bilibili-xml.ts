import { CommentData } from '@ccl2/core';

function format(text: string) {
    return text.replace(/\t/, '\\t');
}

// Fix Mode7 comments when they are bad
function formatmode7(text: string) {
    if (text.charAt(0) === '[') {
        switch (text.charAt(text.length - 1)) {
            case ']':
                return text;
            case '"':
                return text + ']';
            case ',':
                return text.substring(0, text.length - 1) + '"]';
            default:
                return formatmode7(text.substring(0, text.length - 1));
        }
    } else {
        return text;
    }
}

// Try to escape unsafe HTML code. DO NOT trust that this handles all cases
// Please do not allow insecure DOM parsing unless you can trust your input source.
function escapeUnsafe(text: string) {
    text = text.replace(new RegExp('</([^d])', 'g'), '</disabled $1');
    text = text.replace(new RegExp('</(S{2,})', 'g'), '</disabled $1');
    text = text.replace(new RegExp('<([^d/]W*?)', 'g'), '<disabled $1');
    text = text.replace(new RegExp('<([^/ ]{2,}W*?)', 'g'), '<disabled $1');
    return text;
}

interface Options {
    attemptFix: boolean;
    logBadComments: boolean;
}

export class BilibiliXmlParser {
    private attemptFix = true;
    private logBadComments = true;

    constructor(init?: Options) {
        if (typeof init === 'object') {
            this.attemptFix = init.attemptFix === false ? false : true;
            this.logBadComments = init.logBadComments === false ? false : true;
        }
    }

    parseOne(el: Element) {
        try {
            var params = el.getAttribute('p').split(',');
        } catch (e) {
            return null; // Probably not XML
        }

        var text = el.textContent;

        const comment: CommentData = {
            text: '',
            mode: <any>parseInt(params[1]),
            stime: Math.round(parseFloat(params[0]) * 1000),
            size: parseInt(params[2]),
            color: parseInt(params[3]),
            //
            border: false,
            //
            date: parseInt(params[4]),
            pool: parseInt(params[5]),
            hash: params[6],
            dbid: params[7] ? parseInt(params[7]) : undefined,
        };

        comment.position = 'absolute';

        if (comment.mode < 7) {
            comment.text = text.replace(/(\/n|\\n|\n|\r\n)/g, '\n');
        } else {
            if (comment.mode === 7) {
                try {
                    if (this.attemptFix) {
                        text = format(formatmode7(text));
                    }
                    var extendedParams = JSON.parse(text);
                    comment.shadow = true;
                    comment.x = parseFloat(extendedParams[0]);
                    comment.y = parseFloat(extendedParams[1]);
                    if (
                        Math.floor(comment.x) < comment.x ||
                        Math.floor(comment.y) < comment.y
                    ) {
                        comment.position = 'relative';
                    }
                    comment.text = extendedParams[4].replace(
                        /(\/n|\\n|\n|\r\n)/g,
                        '\n'
                    );
                    comment.rZ = 0;
                    comment.rY = 0;
                    if (extendedParams.length >= 7) {
                        comment.rZ = parseInt(extendedParams[5], 10);
                        comment.rY = parseInt(extendedParams[6], 10);
                    }
                    comment.motion = [];
                    comment.movable = false;
                    if (extendedParams.length >= 11) {
                        comment.movable = true;
                        var singleStepDur = 500;
                        var motion = {
                            x: {
                                from: comment.x,
                                to: parseFloat(extendedParams[7]),
                                dur: singleStepDur,
                                delay: 0,
                            },
                            y: {
                                from: comment.y,
                                to: parseFloat(extendedParams[8]),
                                dur: singleStepDur,
                                delay: 0,
                            },
                        };
                        if (extendedParams[9] !== '') {
                            singleStepDur = parseInt(extendedParams[9], 10);
                            motion.x.dur = singleStepDur;
                            motion.y.dur = singleStepDur;
                        }
                        if (extendedParams[10] !== '') {
                            motion.x.delay = parseInt(extendedParams[10], 10);
                            motion.y.delay = parseInt(extendedParams[10], 10);
                        }
                        if (extendedParams.length > 11) {
                            comment.shadow =
                                extendedParams[11] !== 'false' &&
                                extendedParams[11] !== false;
                            if (extendedParams[12] != null) {
                                comment.font = extendedParams[12];
                            }
                            if (extendedParams.length > 14) {
                                // Support for Bilibili advanced Paths
                                if (comment.position === 'relative') {
                                    if (this.logBadComments) {
                                        console.warn(
                                            'Cannot mix relative and absolute positioning!'
                                        );
                                    }
                                    comment.position = 'absolute';
                                }
                                var path = extendedParams[14];
                                var lastPoint = {
                                    x: motion.x.from,
                                    y: motion.y.from,
                                };
                                var pathMotion = [];
                                var regex = new RegExp(
                                    '([a-zA-Z])\\s*(\\d+)[, ](\\d+)',
                                    'g'
                                );
                                var counts = path.split(/[a-zA-Z]/).length - 1;
                                var m = regex.exec(path);
                                while (m !== null) {
                                    switch (m[1]) {
                                        case 'M':
                                            {
                                                lastPoint.x = parseInt(
                                                    m[2],
                                                    10
                                                );
                                                lastPoint.y = parseInt(
                                                    m[3],
                                                    10
                                                );
                                            }
                                            break;
                                        case 'L':
                                            {
                                                pathMotion.push({
                                                    x: {
                                                        from: lastPoint.x,
                                                        to: parseInt(m[2], 10),
                                                        dur:
                                                            singleStepDur /
                                                            counts,
                                                        delay: 0,
                                                    },
                                                    y: {
                                                        from: lastPoint.y,
                                                        to: parseInt(m[3], 10),
                                                        dur:
                                                            singleStepDur /
                                                            counts,
                                                        delay: 0,
                                                    },
                                                });
                                                lastPoint.x = parseInt(
                                                    m[2],
                                                    10
                                                );
                                                lastPoint.y = parseInt(
                                                    m[3],
                                                    10
                                                );
                                            }
                                            break;
                                    }
                                    m = regex.exec(path);
                                }
                                motion = null;
                                comment.motion = pathMotion;
                            }
                        }
                        if (motion !== null) {
                            comment.motion.push(motion);
                        }
                    }
                    comment.dur = 2500;
                    if (extendedParams[3] < 12) {
                        comment.dur = extendedParams[3] * 1000;
                    }
                    var tmp = extendedParams[2].split('-');
                    if (tmp != null && tmp.length > 1) {
                        var alphaFrom = parseFloat(tmp[0]);
                        var alphaTo = parseFloat(tmp[1]);
                        comment.opacity = alphaFrom;
                        if (alphaFrom !== alphaTo) {
                            comment.alphaMotion = {
                                from: alphaFrom,
                                to: alphaTo,
                            };
                        }
                    }
                } catch (e) {
                    if (this.logBadComments) {
                        console.warn(
                            'Error occurred in JSON parsing. Could not parse comment.'
                        );
                        console.log('[DEBUG] ' + text);
                    }
                }
            } else if (comment.mode === 8) {
                comment.code = text; // Code comments are special. Treat them that way.
            } else {
                if (this.logBadComments) {
                    console.warn(
                        'Unknown comment type : ' +
                            comment.mode +
                            '. Not doing further parsing.'
                    );
                    console.log('[DEBUG] ' + text);
                }
            }
        }
        if (comment.text !== null && typeof comment.text === 'string') {
            comment.text = comment.text.replace(/\u25a0/g, '\u2588');
        }
        return comment;
    }

    parseMany(xml: XMLDocument) {
        let elements: HTMLCollectionOf<Element>;
        try {
            elements = xml.getElementsByTagName('d');
        } catch (e) {
            // TODO: handle XMLDOC errors.
            return null; // Bail, I can't handle
        }
        var comments = [];
        for (var i = 0; i < elements.length; i++) {
            var comment = this.parseOne(elements[i]);
            if (comment !== null) {
                comments.push(comment);
            }
        }

        console.debug('[CCL2][BilibiliXML] loaded %d danmaku', comments.length);

        return comments;
    }
}
