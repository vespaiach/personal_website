import swc from '@swc/core'

swc
  .transform('<div>aaa</div>', {
    // Some options cannot be specified in .swcrc
    sourceMaps: true,
    // Input files are treated as module by default.
    isModule: false,

    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true
      },
      target: 'es5',
      loose: false,
      minify: {
        compress: false,
        mangle: false
      }
    },
    module: {
      type: 'es6'
    },
    minify: false
  })
  .then((output) => {
		console.log(output)
  })
