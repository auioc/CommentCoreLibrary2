import { createRollupConfig } from '@ccl2/rollup-config';
import postcss from 'rollup-plugin-postcss';

import tsconfig from './tsconfig.json' assert { type: 'json' };

export default createRollupConfig({
    tsconfig,
    plugins: [
        postcss({
            minimize: true,
        }),
    ],
});
