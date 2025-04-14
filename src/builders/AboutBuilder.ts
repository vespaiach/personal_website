import { BaseBuilder } from './BaseBuilder.js'
import { nunjucks } from '../utils.js'

export class AboutBuilder extends BaseBuilder {
  constructor() {
    super('about')
  }

  generateHtml(): string {
    return nunjucks.render('about.html')
  }
}
