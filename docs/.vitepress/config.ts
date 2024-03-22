import { UserConfig, DefaultTheme } from 'vitepress'

export default {
    title: 'mapbox-extensions',
    description: 'mapbox extensions',
    appearance: 'dark',
    base: '/mapbox-extensions/',
    head: [
        [
            'link', 
            { rel: 'icon', href: '/logo.svg' }
        ]
    ],
    markdown: {
        lineNumbers: true
    },
    themeConfig: {
        logo: '/logo.svg',
        sidebar: [
        ],
        socialLinks: [{ icon: 'github', link: "https://github.com/giserver/mapbox-extensions" }]
    }
} as UserConfig<DefaultTheme.Config>