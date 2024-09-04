import { createRollupConfig } from '@ccl2/rollup-config';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps2';

export default createRollupConfig({
    outputs: [
        {
            file: 'dist/CommentCoreLibrary2.js',
            format: 'iife',
            name: 'CommentCoreLibrary',
            sourcemap: true,
        },
    ], //
    plugins: [nodeResolve(), sourcemaps()],
});
