const render = require('./tasks/render')
const processDocData = require('./tasks/processDocData')
const readDocFile = require('./tasks/readDocFile')
const build = require('./tasks/build')

async function composeDocPage(context, isProd) {
  await readDocFile(context, isProd)
  await processDocData(context, isProd)
  await render(context, isProd)
  await build(context, isProd)
  return context
}

async function composeIndexPage(context, isProd) {
  await render(context, isProd)
  await build(context, isProd)
  return context
}

async function buildDocPage(filePath, { isProd = false, cssFileName } = {}) {
  const zx = await import('zx')
  if (!cssFileName) {
    cssFileName =  await require('./tasks/buildCss')(isProd)
  }

  const fileName = zx.path.basename(filePath, '.md') 
  return composeDocPage({ fileName, cssFileName, layout: 'post' }, isProd)
}

exports.buildDocPage = buildDocPage

import('zx').then(async function (zx) {
  const isProd = zx.$.env.PROD === 'true'

  if (isProd) {
    zx.fs.rmSync('./build', { recursive: true, force: true })
  }

  await zx.$`cp -r ./js ./build`
  const cssFileName = await require('./tasks/buildCss')(isProd)
  const fileNames = await require('./tasks/readDocFolder')()

  const pages = await Promise.all(fileNames.reduce((acc, fileName) => {
    acc.push(buildDocPage(fileName, { isProd, cssFileName }))
    return acc
  }, []))

  await composeIndexPage({ pages, cssFileName, layout: 'index', fileName: 'index' }, isProd)
})
