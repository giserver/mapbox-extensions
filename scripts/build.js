const fs = require('fs');
const { rm } = require('fs/promises')
const path = require('path')
const allTargets = (fs.readdirSync('packages').filter(f => {
    // 过滤掉非目录文件
    if (!fs.statSync(`packages/${f}`).isDirectory()) {
        return false
    }

    const pkg = require(`../packages/${f}/package.json`)
    // 过滤掉私有包和不带编译配置的包
    if (pkg.private || !pkg.buildOptions) {
        return false
    }

    return true
}));


const build = async function (target) {
    const pkgDir = path.resolve(`packages/${target}`)
    const pkg = require(`${pkgDir}/package.json`)

    // 编译前移除之前生成的产物
    await rm(`${pkgDir}/dist`, { recursive: true, force: true })

    // -c 指使用配置文件 默认为rollup.config.js
    // --environment 向配置文件传递环境变量 配置文件通过proccess.env.获取
    await require('execa')(
        'rollup',
        [
            '-c',
            '--environment',
            [
                `TARGET:${target}`
            ]
                .filter(Boolean)
                .join(',')
        ],
        { stdio: 'inherit' }
    )
}

const targets = allTargets // 上面的获取的子包
const maxConcurrency = 4 // 并发编译个数

const buildAll = async function () {
    const ret = []
    const executing = []
    for (const item of targets) {
        // 依次对子包执行build()操作
        const p = Promise.resolve().then(() => build(item))
        ret.push(p)

        if (maxConcurrency <= targets.length) {
            const e = p.then(() => executing.splice(executing.indexOf(e), 1))
            executing.push(e)
            if (executing.length >= maxConcurrency) {
                await Promise.race(executing)
            }
        }
    }
    return Promise.all(ret)
}

// 执行编译操作
buildAll()