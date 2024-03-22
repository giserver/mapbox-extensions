import { defineConfig } from 'vite';

export default defineConfig(() => {
    const nameIndex = process.argv.indexOf("--name");
    if (nameIndex === -1) throw Error("must provide name cmd param");
    const name = process.argv[nameIndex + 1];

    return {
        build: {
            lib: {
                entry: "index.ts",
                name: name,
                formats: ['umd', 'es'],
                fileName: (format) => `index.${format}.js`
            },
            rollupOptions: {
                // 确保外部化处理那些你不想打包进库的依赖
                external: ["proj4"],
                output: {
                    // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                    globals: {
                        proj4: "proj4",
                    },
                }
            }
        }
    }
});