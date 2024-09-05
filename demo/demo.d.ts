/// <reference path="../packages/default/dist/index.d.ts" />

import {
    BilibiliXmlParser,
    CommentManager,
    PreprocessorSet,
    RuleBasedFilter,
} from '../packages/default/dist/index.d.ts';

declare global {
    var CCL: {
        BilibiliXmlParser: typeof BilibiliXmlParser;
        RuleBasedFilter: typeof RuleBasedFilter;
        CommentManager: typeof CommentManager;
        PreprocessorSet: typeof PreprocessorSet;
    };

    interface Window {
        [x: string]: any;
    }
}
