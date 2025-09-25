export const fonts = () => {
  return app.gulp.src(`${app.paths.fontsFolder}/**`, { encoding: false }).pipe(app.gulp.dest(app.paths.base.build + '/fonts'))
}
