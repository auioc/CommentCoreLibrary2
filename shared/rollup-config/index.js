import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';

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
                    sourcemap: true,
                },
                ...outputs,
            ],
            external,
            plugins: [typescript(), ...plugins],
            watch: {
                include: 'src/**',
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
