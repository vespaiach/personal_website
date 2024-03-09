async function composer(context) {
  await require('./tasks/readDocFile')(context, isProd)
  await require('./tasks/processDocData')(context, isProd)
  await require('./tasks/render')(context, isProd)
  await require('./tasks/build')(context, isProd)
  return context
}

import('zx').then(async function (zx) {
  const isProd = zx.$.env.PROD === 'true'

  if (isProd) {
    zx.fs.rmSync('./build', { recursive: true, force: true })
  }

  const cssFileName = await require('./tasks/buildCss')(isProd)
  const fileNames = await require('./tasks/readDocFolder')()
  const promises = fileNames.reduce((acc, fileName) => {
    acc.push(composer({ fileName, cssFileName }))
    return acc
  }, [])

  await Promise.all(promises)
})
