import { defineConfig } from 'vite';

export default defineConfig(() => {
    return {
        build: {
            lib: {
                entry: "index.ts",
                name: "Giserver",
                formats: ['es', 'umd'],
                fileName: (format) => `index.${format}.js`
            },
            rollupOptions: {
                // 确保外部化处理那些你不想打包进库的依赖
                external: ["proj4", "wheater", /@giserver/, /@turf/],
            },
        }
    }
});