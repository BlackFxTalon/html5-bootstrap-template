var gulp = require("gulp"),
  del = require("del"),
  autoprefixer = require("gulp-autoprefixer"),
  browserSync = require("browser-sync"),
  sass = require("gulp-sass"),
  concat = require("gulp-concat"),
  rename = require("gulp-rename"),
  imagemin = require("gulp-imagemin"),
  plumber = require("gulp-plumber"),
  csso = require("gulp-csso"),
  sourcemaps = require("gulp-sourcemaps"),
  uncss = require("gulp-uncss"),
  uglify = require("gulp-uglify-es").default,
  webpack = require("webpack"),
  webpackStream = require("webpack-stream");

var paths = {
  dirs: {
    build: "./build"
  },
  html: {
    src: ["./src/pages/*.html", "./src/index.html"],
    dest: "./build",
    watch: ["./src/pages/*.html", "./src/index.html"]
  },
  css: {
    src: "./src/styles/style.scss",
    dest: "./build/css",
    watch: ["./src/styles/**/*.scss", "./src/styles/*.scss"]
  },
  js: {
    src: [
      "./src/scripts/plugins.js",
      "./src/scripts/pages/*.js",
      "./src/scripts/index.js"
    ],
    dest: "./build/js",
    watch: "./src/scripts/**/*.js"
  },
  images: {
    src: "./src/images/*",
    dest: "./build/img",
    watch: "./src/images/*"
  },
  fonts: {
    src: "./src/fonts/*",
    dest: "./build/fonts",
    watch: "./src/fonts/*"
  }
};

gulp.task("clean", function() {
  return del(paths.dirs.build);
});

gulp.task("templates", function() {
  return gulp
    .src(paths.html.src)
    .pipe(plumber())
    .pipe(gulp.dest(paths.html.dest))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

gulp.task("styles", function() {
  return gulp
    .src(paths.css.src)
    .pipe(plumber())
    .pipe(sass())
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"]
      })
    )
    .pipe(sourcemaps.init())
    .pipe(csso())
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.css.dest))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

gulp.task("scripts", function() {
  return gulp
    .src(paths.js.src)
    .pipe(plumber())
    .pipe(
      webpackStream({
        output: {
          filename: "scripts.js"
        },
        module: {
          rules: [
            {
              test: /\.(js)$/,
              exclude: /(node_modules)/,
              loader: "babel-loader",
              query: {
                presets: ["env"]
              }
            }
          ]
        },
        externals: {
          jquery: "jQuery"
        }
      })
    )
    .pipe(uglify())
    .pipe(sourcemaps.init())
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.js.dest))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

gulp.task("images", function() {
  return gulp
    .src(paths.images.src)
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(
      rename({
        dirname: ""
      })
    )
    .pipe(gulp.dest(paths.images.dest));
});

gulp.task("fonts", function() {
  return gulp
    .src(paths.fonts.src)
    .pipe(plumber())
    .pipe(gulp.dest(paths.fonts.dest))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

gulp.task("server", function() {
  browserSync.init({
    server: {
      baseDir: paths.dirs.build
    },
    reloadOnRestart: true,
    tunnel: "remote"
  });
  gulp.watch(paths.html.watch, gulp.parallel("templates"));
  gulp.watch(paths.css.watch, gulp.parallel("styles"));
  gulp.watch(paths.js.watch, gulp.parallel("scripts"));
  gulp.watch(paths.images.watch, gulp.parallel("images"));
  gulp.watch(paths.fonts.watch, gulp.parallel("fonts"));
});

gulp.task(
  "build",
  gulp.series("clean", "templates", "styles", "scripts", "images", "fonts")
);

gulp.task("dev", gulp.series("build", "server"));
