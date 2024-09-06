import { dev, createRollupConfig } from '@ccl2/rollup-config';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps2';
import fg from 'fast-glob';

export default createRollupConfig({
    outputs: [
        {
            file: 'dist/CommentCoreLibrary2.js',
            format: 'iife',
            name: 'CommentCoreLibrary',
            footer: 'window.CCL = window.CommentCoreLibrary;',
            sourcemap: dev,
        },
    ],
    plugins: [
        {
            name: 'watch-packages',
            async buildStart() {
                const files = await fg('../*/dist/index.js');
                for (let file of files) {
                    // TODO
                    if (!file.includes('default')) {
                        this.addWatchFile(file);
                    }
                }
            },
        },
        nodeResolve(),
        sourcemaps(),
    ],
});
