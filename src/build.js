import fs from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import { readFileContent, getPosts } from './utils.js'
import path from 'path'
import _ from 'lodash'

async function generate() {
	const indexTemplatePath = path.resolve('src/index.html')
	const indexTemplate = await readFileContent(indexTemplatePath)
	const indexCompiled = _.template(indexTemplate)

	const postTemplatePath = path.resolve('src/post.html')	
	const postTemplate = await readFileContent(postTemplatePath)
	const postCompiled = _.template(postTemplate)

	// Create dist folder if it doesn't exist
	if (!existsSync('dist')) { mkdirSync('dist') }

	const posts = await getPosts()

	const html = indexCompiled({ posts })
	await fs.writeFile('dist/index.html', html)

	posts.forEach(async (post) => {
		const html = postCompiled({ post })
		await fs.writeFile(`dist/${post.slug}.html`, html)
	})

	// Copy recursively all files in public folder to dist folder
	await fs.cp('public', 'dist', { recursive: true })
}

generate()