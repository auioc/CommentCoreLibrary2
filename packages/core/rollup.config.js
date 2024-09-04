import { createRollupConfig } from '@ccl2/rollup-config';

import tsconfig from './tsconfig.json' assert { type: 'json' };

export default createRollupConfig({ tsconfig });
