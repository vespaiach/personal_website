module.exports = async function () {
  const zx = await import('zx')

  return zx.fs.readdirSync('./docs').map((fileName) => {
    return zx.path.basename(fileName, '.md')
  })
}