/* eslint-disable */
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';

export const dev = process.env.BUILD === 'development';

export function createRollupConfig({
    tsconfig = {},
    external = [],
    outputs = [],
    plugins = [],
} = {}) {
    return [
        {
            input: 'src/index.ts',
            output: [
                {
                    file: 'dist/index.js',
                    format: 'es',
                    sourcemap: dev,
                },
                ...outputs,
            ],
            external,
            plugins: [typescript(), ...plugins],
            watch: {
                buildDelay: 500,
            },
        },
        {
            input: 'dist/dts/index.d.ts',
            output: [
                {
                    file: 'dist/index.d.ts',
                    format: 'es',
                },
            ],
            external: [/\.css$/],
            plugins: [
                dts({
                    compilerOptions: {
                        baseUrl: 'dist/dts',
                        ...(tsconfig?.compilerOptions?.paths
                            ? { paths: tsconfig.compilerOptions.paths }
                            : {}),
                    },
                }),
            ],
            watch: {
                include: 'dist/dts/**',
            },
        },
    ];
}
