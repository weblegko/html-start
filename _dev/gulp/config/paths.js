const srcFolder = './src'
const buildFolder = '../assets'

export const paths = {
  base: {
    src: srcFolder,
    build: buildFolder
  },
  srcSvg: `${srcFolder}/img/svg/**.svg`,
  srcImgFolder: `${srcFolder}/img`,
  buildImgFolder: `${buildFolder}/img`,

  srcScss: `${srcFolder}/scss/**/*.scss`,
  buildCssFolder: `${buildFolder}/css`,

  srcFullJs: `${srcFolder}/js/**/*.js`,
  srcMainJs: `${srcFolder}/js/main.js`,
  buildJsFolder: `${buildFolder}/js`,

  srcPartialsFolder: `${srcFolder}/html/partials`,

  fontsFolder: `${srcFolder}/fonts`
}
