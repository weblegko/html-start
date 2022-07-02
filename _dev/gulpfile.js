const path = require('path');
const del = require('del');
const gulp = require('gulp');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const changed = require('gulp-changed');
const gulpif = require('gulp-if');
const nunjucksRender = require('gulp-nunjucks-render');
const sass = require('gulp-sass')(require('node-sass'));
const autoprefixer = require('gulp-autoprefixer');
const groupCssMediaQueries = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const webpackStream = require('webpack-stream');
const webpack = webpackStream.webpack;
const named = require('vinyl-named');
const logger = require('gulplog');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const argv = require('yargs').argv;
const isDev = !argv.prod; // || !process.env.NODE_ENV || process.env.NODE_ENV == 'development';
const isProd = argv.prod;


/**
 * Конфигурация путей к файлам проекта
 */
const srcPath =  'src/';
const buildPath = '../assets/';

const paths = {
    src: {
        html: srcPath + 'html/',
        scss: srcPath + 'scss/',
        fonts: srcPath + 'fonts/',
        data: srcPath + 'data/',
        img: srcPath + 'img/',
        js: srcPath + 'js/',
    },
    build: {
        html: buildPath,
        css: buildPath + 'css/',
        fonts: buildPath + 'fonts/',
        data: buildPath + 'data/',
        img: buildPath + 'img/',
        js: buildPath + 'js/',
    }
};


/**
 * Стили которые нужно взять из каких нить node_modules 
 * и добавить в файл vendors.css
 */
const CssForAddToVendors = [
    './node_modules/slick-carousel/slick/slick.css',
    './node_modules/@fancyapps/fancybox/dist/jquery.fancybox.css',
];


/**
 * browserSync - вебсервер с интерактивным обновлением разрабатываемой страницы
 */
gulp.task('serve', function(done) {
    browserSync.init({
        server: buildPath,
        //proxy: "site.loc" // если работаем с внешним вебсервером site.loc - заменить на свой домен
    });
    browserSync.watch([
        buildPath + 'js/*.*', 
        //buildPath + '../**/*.php' // раскомментировать - если надо следить за изменением php файлов
    ]).on('change', browserSync.reload);
    done();
});


/**
 * HTML сбока nunjucks
 */
gulp.task('html', () => {
    return gulp.src(paths.src.html+'pages/**/*.html')
        .pipe(changed(paths.build.html, {
            extension: '.html'
        }))
        .pipe(nunjucksRender({ path: [paths.src.html, paths.src.html + 'layouts/', paths.src.html + 'partials/'] }))
        .pipe(gulp.dest(paths.build.html));
});
/**
 * HTML nunjucks layout
 */
gulp.task('htmlLayoutPartials', () => {
    return gulp.src(paths.src.html + 'pages/**/*.html')
        .pipe(nunjucksRender({ path: [paths.src.html, paths.src.html + 'layouts/', paths.src.html + 'partials/'] }))
        .pipe(gulp.dest(paths.build.html));
});


/**
 * Основные стили проекта сборка из SCSS
 */
gulp.task('scss', () => {
    return gulp.src(paths.src.scss + 'main.scss')
        .pipe(plumber({
            errorHandler: notify.onError(err => ({
                title: err.plugin,
                message: err.message
            }))
        }))
        .pipe(gulpif(isDev, sourcemaps.init()))
        .pipe(sass({
            includePaths: ['node_modules'],
            outputStyle: 'expanded',
            precision: 8
        }))
        .pipe(groupCssMediaQueries())
        .pipe(autoprefixer({
            grid: true,
            overrideBrowserslist: ["last 3 versions"],
            cascade: true
        }))
        .pipe(gulpif(isProd, cleanCSS()))
        .pipe(gulpif(isDev, sourcemaps.write('.')))
        .pipe(gulp.dest(paths.build.css))
        .pipe(browserSync.stream());
});


/**
 * Сборка стилей из стронних файлов SCSS
 */
gulp.task('scss_vendors', () => {
    return gulp.src(paths.src.scss + 'vendors.scss')
        .pipe(plumber({
            errorHandler: notify.onError(err => ({
                title: err.plugin,
                message: err.message
            }))
        }))
        .pipe(sass({
            includePaths: ['node_modules'],
            outputStyle: 'expanded',
            precision: 8
        }))
        .pipe(autoprefixer({
            grid: true,
            overrideBrowserslist: ["last 3 versions"],
            cascade: true
        }))
        .pipe(gulpif(isProd, cleanCSS()))
        .pipe(gulp.dest(paths.build.css))

});


/**
 * Добавление к vendors.css заданных стилей из node_modules
 * CssForAddToVendors - массив с путями к файлам стилей которые надо добавить
 */
gulp.task('add_to_vendors_css', () => {
    console.log('Добавим CSS из заданного списка');
    return gulp.src([ 
            paths.build.css + 'vendors.css',
            ...CssForAddToVendors
        ])
        .pipe(concat('vendors.css'))
        .pipe(gulp.dest(paths.build.css));
});


/**
 * Сборка java script 
 * при помощи webpack
 */
gulp.task('js', callback => {
    
    let firstBuildReady = false;

    function done(err, stats) {
        firstBuildReady = true;

        if (err) {
            return;
        }

        logger[stats.hasErrors() ? 'error' : 'info'](stats.toString({
            colors: true
        }));

    }

    let options = {
        watch: isDev,
        mode: isDev ? 'development' : 'production',
        devtool: isDev ? 'inline-source-map' : false,
        plugins: [
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery'
            })
        ],
        module: {
            rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    presets: [
                        '@babel/preset-env'
                    ],
                    plugins: [
                        '@babel/plugin-proposal-class-properties'
                    ]
                }

            }]
        },
        optimization: {
            noEmitOnErrors: true,
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all'
                    }
                }
            }
        }
    };

    return gulp.src(paths.src.js + 'main.js')
        .pipe(plumber({
            errorHandler: notify.onError(err => ({
                title: err.plugin,
                message: err.message
            }))
        }))
        .pipe(named())
        .pipe(webpackStream(options, null, done))
        // .pipe(gulpif(isProd, uglify()))
        .pipe(gulp.dest(paths.build.js))
        .on('data', () => {
            if (firstBuildReady) {
                callback();
            }
        });
});


/**
 * Обработка шрифтов, копирование в нужную папку
 */
gulp.task('fonts', () => {
    return gulp.src(paths.src.fonts + '**/*.{ttf,eot,svg,woff,woff2,otf,css}')
        .pipe(changed(paths.build.fonts))
        .pipe(gulp.dest(paths.build.fonts));
});


/**
 * Копирование файлов из папки data,
 * это могут быть видосы, файлы звуков
 */
gulp.task('data', () => {
    return gulp.src(paths.src.data + '**/*.*')
        .pipe(changed(paths.build.data))
        .pipe(gulp.dest(paths.build.data));
});


/**
 * Минимизация картинок и перенос их в нужную папку
 */
gulp.task('img', () => {
    return gulp.src(paths.src.img + '**/*.{gif,png,jpg,svg,webp}')
        .pipe(changed(paths.build.img))
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({
              quality: 75,
              progressive: true
            }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
              plugins: [
                { removeViewBox: true },
                { cleanupIDs: false }
              ]
            })
          ]))
        .pipe(gulp.dest(paths.build.img));
});


/**
 * Очистка проекта - удаление всего что собрано ранее
 */
gulp.task('clean', (done) => {
    del([buildPath], {
        force: true
    });
    done();
});


/**
 * Отслеживание изменений в проекте
 * и обработка таковых - пересборка, если нужно
 */
gulp.task('watch', (done) => {
    
    gulp.watch(paths.src.html + 'pages/**/*.html', gulp.series('html')).on('change', browserSync.reload);;
    
    gulp.watch([
        paths.src.html + 'layouts/**/*.html',
        paths.src.html + 'partials/**/*.html'
    ], gulp.series('htmlLayoutPartials')).on('change', browserSync.reload);;

    gulp.watch([
        paths.src.scss + 'vendors.scss',
        paths.src.scss + 'vendors/**/*.scss'
    ], gulp.series('scss_vendors', 'add_to_vendors_css'));

    gulp.watch([
        paths.src.scss + '**/*.scss',
        '!' + paths.src.scss + 'vendors.scss',
        '!' + paths.src.scss + 'vendors/**/*.scss'
    ], gulp.series('scss'));

    gulp.watch(paths.src.js + '**/*.js', gulp.series('js'));

    gulp.watch(paths.src.fonts + '**/*.{ttf,eot,svg,woff,woff2,otf}', gulp.series('fonts')).on('unlink', filepath => {
        del.sync(path.resolve(paths.build.fonts, path.relative(path.resolve(paths.src.fonts), filepath)));
    });

    gulp.watch(paths.src.data + '**/*.*', gulp.series('data')).on('unlink', filepath => {
        del.sync(path.resolve(paths.build.data, path.relative(path.resolve(paths.src.data), filepath)));
    });

    gulp.watch(paths.src.img + '**/*.{jpg,png,gif,svg}', gulp.series('img')).on('unlink', filepath => {
        del.sync(path.resolve(paths.build.img, path.relative(path.resolve(paths.src.img), filepath)));
    });

    done();
});


/**
 * Сборка проекта 
 * Разработка: gulp build 
 * Продакшен: gulp build --prod 
 */
gulp.task('build', gulp.series('clean', 'scss_vendors', gulp.parallel('fonts', 'img', 'scss', 'js', 'html'), 'add_to_vendors_css'));


/**
 *  Таск который выполняются по умолчанию при запуске в консоле команды gulp
 */
gulp.task('default', gulp.series('build', gulp.parallel('watch', 'serve')));