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
        sidebar: {
            "/guide": {
                "base": "/guide",
                items: [
                    { text: "简介", link: "/" },
                    { text: "安装", link: "/install" },
                    {
                        text: "组件",
                        base: "/guide/controls",
                        collapsed: true,
                        items: [
                            { text: "bto", collapsed: true, link: "/bto" },
                            { text: "doodle", collapsed: true, link: "/doodle" }
                        ]
                    }
                ]
            }
        },
        // nav: [{ 'text': "组件", link: '/controls/' }],
        socialLinks: [{ icon: 'github', link: "https://github.com/giserver/mapbox-extensions" }],
    }
} as UserConfig<DefaultTheme.Config>