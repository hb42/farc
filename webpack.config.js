/**
 *  webpack config f. angular2-app
 *  (sollte ohne Anpassung uebertragbar sein)
 *
 *  mit bootstrap + fontawesome
 *
 *  Verzeichnisstruktur:
 *    ./src        |source-code
 *         /app    |*.ts
 *              /app.module.ts -> ng2 start
 *              /app.component.ts -> start component (<router-outlet>)
 *              /app.routing.ts -> routing def
 *               ...
 *         /common -> symlink auf ../shared/src
 *         /css    |app styles
 *         ...     -> components, images
 *         /resource |wird 1:1 nach dist/resource kopiert
 *             /app.config.dev.json  -> development config
 *             /ap..config.prod.json -> production config
 *              ...
 *         /vendor.ts -> polyfills, ext lib
 *         /boot.ts   -> entry (config laden, user auth. + bootstrap starten)
 *         /index.html
 *    ./config     | build config -> metadata.CONFIG
 *            /config.dev.json
 *            /config.prod.json
 *    ./dist       |target
 *    ./node_modules -> symlink auf ../shared/node_modules
 *    ./typings
 *    ./div        |alles andere
 *    ./.bootstraprc              |bootstrap-plugin config
 *    ./font-awesome.config.js    |fontawesome-plugin config
 *    ./font-awesome.config.less  | -"-
 *    ./package.json              |deps + version info
 *    ./tsconfig.json             |typescript (excludes!)
 *    ./tslint.json               |tslint config
 *    ./typings.json              |typings
 *    ./webpack.config.js         |this
 *
 */


var path = require('path');
var fs = require('fs');
//var zlib = require('zlib');
// Webpack + Plugins
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackMd5Hash    = require('webpack-md5-hash');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
//const CompressionPlugin = require('compression-webpack-plugin');
const ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;

/**
 * Damit aus der command line Parameter uebergeben werde koennen, muss der export als function
 * aufgebaut werden. Die function liefert das config.Object zurueck.
 *
 * Der Funktions-Parameter "env" enthaelt alle per --env.par="blah" definierten Variablen.
 * z.B.:
 * ... --env.release --env.test1="blah"
 * -> env = { release: true, test1: "blah" }
 *
 */
module.exports = function(env) {

  env = env || {};
  var release = env.release || false;
  var SPK = env.spk || false;  // build f. SPK-Umgebung

  var ENV = process.env.NODE_ENV = process.env.ENV = release ? 'production' : 'development';
// Testserver
  var HOST = process.env.HOST || 'localhost';
  var PORT = process.env.PORT || 8080;

// Pfade/Dateinamen
  var cwd = process.cwd();
  var npmRoot = cwd + "/node_modules";
  var sourceDir = cwd + "/src";
  var filesTarget = 'resource'; // targetDir + "/resource"; -> copy-webpack-plugin (s.u.)
  var filesDir = sourceDir + '/' + filesTarget;
  var index_html = sourceDir + '/index.html';
  var vendorFile = sourceDir + '/vendor.ts';
  var bootstrapFile = sourceDir + '/boot.ts';
  var sonstDir = cwd + "/div";
  var targetDir = cwd + "/dist";
  var packageFile = cwd + '/package.json';
// -> metadata.CONFIG -> webpackConfig.metadata.CONFIG.sessionIdCall
  var configFile = cwd + "/config/" + (release ? "config.prod.json" : "config.dev.json");
// config file wird zur Laufzeit geladen, dadurch nachtraegliche Anpassung moeglich
  var appConfigFile = "/" + filesTarget + "/app.config" + (release ? ".prod" : ".dev") + (SPK ? ".spk" : "") + ".json";

// package.json holen und buildnumber setzen
  var PACKAGE = getPackage(packageFile, ENV);

// index.html-metadata & app-var metadata
  var builddate = new Date().toLocaleString();
  var metadata = {
    'VERSIONSTR': PACKAGE.name + ' ' + PACKAGE.version + PACKAGE.release + ' (build ' + PACKAGE.buildnumber + '/ ' + builddate + ' ' + ENV + ')',
    //'BASEURL': '/wstest02/',  // '/' fuer stand alone, '/context-root/' fuer wepapp (incl. abschliessendem /)
    // verwendet im <head>, von HtmlWebpackPlugin via output.publicPath
    // und beim Bootstrap -> provide(APP_BASE_HREF, {useValue: process.env.BASEURL})
    'BASEURL'   : '/',
    'HOST'      : HOST,
    'PORT'      : PORT,
    'NAME'      : PACKAGE.name,
    'VERSION'   : PACKAGE.version,
    'RELEASE'   : PACKAGE.release,
    'BUILD'     : PACKAGE.buildnumber,
    'DESC'      : PACKAGE.description,
    'COPY'      : PACKAGE.copyright,
    'ENV'       : ENV,
    'NODE_ENV'  : ENV,
    'CONFIG'    : require(configFile),
    'CONFIGFILE': appConfigFile,
  };
//TODO package.json f. NW.js generieren
//     f. nw muss auch baseurl angepasst werden

  /*
   * Webpack configuration
   *
   * See: http://webpack.github.io/docs/configuration.html#cli
   */
  return {

    /*
     * Cache generated modules and chunks to improve performance for multiple incremental builds.
     * This is enabled by default in watch mode.
     * You can pass false to disable it.
     *
     * See: http://webpack.github.io/docs/configuration.html#cache
     */
    //cache: false,

    // for faster builds use 'eval'
    devtool: release ? 'source-map' : 'cheap-module-eval-source-map',
    target : 'web',  // alt.: node || node-webkit -> BaseUrl!!

    /*
     * Cache generated modules and chunks to improve performance for multiple incremental builds.
     * This is enabled by default in watch mode.
     * You can pass false to disable it.
     *
     * See: http://webpack.github.io/docs/configuration.html#cache
     */
    // cache: false,

    /*
     * The entry point for the bundle
     * Our Angular.js app
     *
     * See: http://webpack.github.io/docs/configuration.html#entry
     */
    entry: {
      // bootstrap-loader (s.a. https://github.com/shakacode/bootstrap-loader)
      //                  -> npm install bootstrap-loader bootstrap-sass + deps s. github + jquery
      // config -> ./.bootstraprc
      'bootstrap': release ? 'bootstrap-loader/extractStyles' : 'bootstrap-loader',

      // font awesome-loader (s.a. https://www.npmjs.com/package/font-awesome-webpack2)
      //                     -> npm install font-awesome font-awesome-webpack2
      // config -> ./font-awesome.config.js + ./font-awesome.config.less
      'fontawesome': 'font-awesome-webpack2!./font-awesome.config.js',

      // external libs
      'vendor': vendorFile,

      // angular app
      'app': bootstrapFile
    },

    /**
     * Options affecting the output of the compilation.
     *
     * See: http://webpack.github.io/docs/configuration.html#output
     */
    output: {
      /**
       * The output directory as absolute path (required).
       *
       * See: http://webpack.github.io/docs/configuration.html#output-path
       */
      path             : targetDir,
      publicPath       : metadata.BASEURL,
      /**
       * Specifies the name of each output file on disk.
       * IMPORTANT: You must not specify an absolute path here!
       *
       * See: http://webpack.github.io/docs/configuration.html#output-filename
       */
      filename         : '[name].[chunkhash].js',
      /**
       * The filename of the SourceMaps for the JavaScript files.
       * They are inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
       */
      sourceMapFilename: '[file].map',  // [file] enthaelt .js|.css dadurch verschiedene mapS f. js und css
      /**
       * The filename of non-entry chunks as relative path
       * inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
       */
      chunkFilename    : '[id].[chunkhash].chunk.js'
    },

    /*
     * Options affecting the resolving of modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#resolve
     */
    resolve      : {
      // remove other default values
      // modulesDirectories: ['node_modules'],
      /*
       * An array of extensions that should be used to resolve modules.
       *
       * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
       */
      extensions: ['.ts', '.js', '.json', '.css', '.html', 'png', 'jpg', 'gif', 'scss', 'svg', 'woff', 'ttf', 'eot', 'otf', 'svg'],

      // An array of directory names to be resolved to the current directory (absolute path!)
      modules: [ npmRoot ],

    },
    resolveLoader: {
      //
    },

    /*
     * Options affecting the normal modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#module
     */
    module: {

      /*
       * An array of applied pre and post loaders.
       *
       * See: http://webpack.github.io/docs/configuration.html#module-preloaders-module-postloaders
       */
      // preLoaders: [
      //   /*
      //    * Tslint loader support for *.ts files
      //    *
      //    * See: https://github.com/wbuchwalter/tslint-loader
      //    */
      //   { test: /\.ts$/,
      //     loader: 'tslint-loader',
      //     exclude: [
      //       npmRoot,
      //       sonstDir
      //     ]
      //   },
      //   /*
      //    * Source map loader support for *.js files
      //    * Extracts SourceMaps for source files that as added as sourceMappingURL comment.
      //    *
      //    * See: https://github.com/webpack/source-map-loader
      //    */
      //   { test: /\.js$/,
      //     loader: "source-map-loader",
      //     exclude: [
      //       sonstDir,
      //       // these packages have problems with their sourcemaps
      //       npmRoot + '/rxjs',
      //       npmRoot + '/@angular2-material',
      //       npmRoot + '/@angular',
      //       npmRoot + "/@ngrx",
      //       npmRoot + "/primeng",  // test
      //     ]
      //   }
      // ],

      /*
       * An array of automatically applied loaders.
       *
       * IMPORTANT: The loaders here are resolved relative to the resource which they are applied to.
       * This means they are not resolved relative to the configuration file.
       *
       * See: http://webpack.github.io/docs/configuration.html#module-loaders
       */
      rules: [

        /*
         * Typescript loader support for .ts and Angular 2 async routes via .async.ts
         *
         * See: https://github.com/s-panferov/awesome-typescript-loader
         */
        {
          test   : /\.ts$/,
          loaders: [
            // falls Fehlermeldungen stoeren sollten...
            // 'awesome-typescript-loader?{ignoreDiagnostics:[2688]}',
            'awesome-typescript-loader',
            'angular2-template-loader'
          ],
          exclude: [/\.(spec|e2e)\.ts$/]
        },

        {
          test  : /\.(png|jpg|gif)$/,
          loader: "url-loader?limit=50000&name=[path][name].[ext]"
        },

        /*
         * Json loader support for *.json files.
         *
         * See: https://github.com/webpack/json-loader
         */
        {
          test  : /\.json$/,
          loader: 'json-loader'
        },

        {
          test  : /^(?!.*\.min\.css$).*\.css$/,
          // loaders: ["style-loader", "css-loader"]
          loader: ExtractTextPlugin.extract({
                                              fallbackLoader: "style-loader",
                                              loader        : "css-loader?sourceMap"
                                            })
        },

        {
          test   : /\.scss$/,
          loaders: ['style-loader',
            ExtractTextPlugin.extract({
                                        fallbackLoader: "style-loader",
                                        loader        : "css-loader?sourceMap"
                                      }),
            'sass-loader' + '?outputStyle=expanded' + '&' + 'root=' + sourceDir
            + '&' + 'includePaths[]' + npmRoot + '&' + 'includePaths[]' + sourceDir
          ]
        },

        /* Raw loader support for *.html
         * Returns file content as string
         *
         * See: https://github.com/webpack/raw-loader
         */
        {
          test   : /\.html$/,
          loader : 'raw-loader',
          exclude: [index_html]
        },

        // w/ font awesome-loader + bootstrap-loader
        {
          test  : /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: "url-loader?limit=10000&minetype=application/font-woff"
        },

        {
          test  : /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: "file-loader"
        }

      ],

      noParse: [
        sonstDir,
        /\.min\.js/,
        npmRoot + '/zone.js/dist',
        npmRoot + "/mongoose",
      ]
    },

    /*
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [
      /*
       * Plugin: ForkCheckerPlugin
       * Description: Do type checking in a separate process, so webpack don't need to wait.
       *
       * See: https://github.com/s-panferov/awesome-typescript-loader#forkchecker-boolean-defaultfalse
       */
      new ForkCheckerPlugin(),

      // /*
      //  * Plugin: OccurenceOrderPlugin
      //  * Description: Varies the distribution of the ids to get the smallest id length
      //  * for often used ids.
      //  *
      //  * See: https://webpack.github.io/docs/list-of-plugins.html#occurrenceorderplugin
      //  * See: https://github.com/webpack/docs/wiki/optimization#minimize
      //  */
      // new webpack.optimize.OccurenceOrderPlugin(true),

      /**
       * Plugin: WebpackMd5Hash
       * Description: Plugin to replace a standard webpack chunkhash with md5.
       *
       * See: https://www.npmjs.com/package/webpack-md5-hash
       */
      new WebpackMd5Hash(),

      /**
       * Plugin: DedupePlugin
       * Description: Prevents the inclusion of duplicate code into your bundle
       * and instead applies a copy of the function at runtime.
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
       * See: https://github.com/webpack/docs/wiki/optimization#deduplication
       */
      // Prob. mit webpack2 -> https://github.com/webpack/webpack/issues/2644
      // new webpack.optimize.DedupePlugin(),  // prod only !f. watch mode

      /*
       * Plugin: CommonsChunkPlugin
       * Description: Shares common code between the pages.
       * It identifies common modules and put them into a commons chunk.
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
       * See: https://github.com/webpack/docs/wiki/optimization#multi-page-app
       */
      new webpack.optimize.CommonsChunkPlugin({
        name     : 'vendor',
        filename : 'vendor.[chunkhash].js',
        minChunks: Infinity
      }),

      /*
       * Plugin: CopyWebpackPlugin
       * Description: Copy files and directories in webpack.
       *
       * Copies project static assets.
       *
       * See: https://www.npmjs.com/package/copy-webpack-plugin
       */
      // glob fkt z.Z. nicht -> https://github.com/kevlened/copy-webpack-plugin/issues/18
      // eigentlich: from= abs path/**/* to=abs path sollte alles ab /** nach to kopieren
      //             kopiert aber Teil des from-paths mit
      new CopyWebpackPlugin([
        {
          from  : filesDir,  // + text files etc.
          to    : filesTarget,
          toType: 'dir'
        },
        {from: sourceDir + '/error.html'}
      ]),

      /*
       * Plugin: ExtractTextPlugin
       * Description: It moves every require("style.css") in entry chunks into a separate css output file.
       * So your styles are no longer inlined into the javascript, but separate in a css bundle file (styles.css).
       * If your total stylesheet volume is big, it will be faster because the stylesheet bundle is loaded in
       * parallel to the javascript bundle.
       *
       * See: https://github.com/webpack/extract-text-webpack-plugin
       */
      new ExtractTextPlugin("[name].[chunkhash].css"),

      /*
       * Plugin: HtmlWebpackPlugin
       * Description: Simplifies creation of HTML files to serve your webpack bundles.
       * This is especially useful for webpack bundles that include a hash in the filename
       * which changes every compilation.
       *
       * See: https://github.com/ampedandwired/html-webpack-plugin
       */
      new HtmlWebpackPlugin({
        // template: 'src/index.html',
        template: index_html,
        title: metadata.DESC,
        chunksSortMode: 'dependency',
        metadata: metadata,
        inject: 'head'
      }),
      /**
       * Plugin: DefinePlugin
       * Description: Define free variables.
       * Useful for having development builds with debug logging or adding global constants.
       *
       * Environment helpers
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
       */
      // NOTE: when adding more properties make sure you include them in custom-typings.d.ts
      new webpack.DefinePlugin({
        // Environment helpers
        'WEBPACK_DATA': {
          'metadata': JSON.stringify(metadata),
        }
      }),

      new webpack.ProvidePlugin({
        // TypeScript helpers
        // '__metadata': 'ts-helper/metadata',
        // '__decorate': 'ts-helper/decorate',
        // '__awaiter': 'ts-helper/awaiter',
        // '__extends': 'ts-helper/extends',
        // '__param': 'ts-helper/param',

        // 'Reflect': 'es7-reflect-metadata/dist/browser',  // wg. angular2 - klappt ohne?

        // jQuery global laden (-> npm install jquery) pri wg. bootstrap
        $     : "jquery",
        jQuery: "jquery"

      }),

      /**
       * Plugin: UglifyJsPlugin
       * Description: Minimize all JavaScript output of chunks.
       * Loaders are switched into minimizing mode.
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
       */
      new webpack.optimize.UglifyJsPlugin({
        beautify: release ? false : true,
        // TODO bug ab RC5 https://github.com/angular/angular/issues/10618
        // TODO  -> mangle: { screw_ie8: true, keep_fnames: true}
        mangle  : release ? {screw_ie8: true, keep_fnames: true} : false,
        compress: release ? {screw_ie8: true}
          : {screw_ie8: true, keep_fnames: true, drop_debugger: false, dead_code: false, unused: false,},
        comments: release ? false : true,
        // dead_code: release ? true : false,
        // unused: release ? true : false,
        // deadCode: release ? true : false
      }),

      /* Damit die Komprimierung hilft, muss der Webserver entsprechend konfiguriert werden.
       * Die Konfigurationsdetails waeren zu klaeren, ebenso die Frage, wieviel das bringt.
       */
      // new CompressionPlugin({
      //   algorithm: gzipMaxLevel,
      //   regExp: /\.css$|\.html$|\.js$|\.map$/,
      //   threshold: 2 * 1024
      // }),

      /**
       * Plugin LoaderOptionsPlugin (experimental)
       *
       * See: https://gist.github.com/sokra/27b24881210b56bbaff7
       */
      new webpack.LoaderOptionsPlugin({
        debug: !release,
        options: {
          context: cwd,
          output: { path :  targetDir },

          /**
           * Static analysis linter for TypeScript advanced options configuration
           * Description: An extensible linter for the TypeScript language.
           *
           * See: https://github.com/wbuchwalter/tslint-loader
           */
          tslint: {
            emitErrors: true,
            failOnHint: release,
            resourcePath: 'src'
          },


          /**
           * Html loader advanced options
           *
           * See: https://github.com/webpack/html-loader#advanced-options
           */
          // TODO: Need to workaround Angular 2's html syntax => #id [bind] (event) *ngFor
          htmlLoader: {
            minimize: release,
            removeAttributeQuotes: false,
            caseSensitive: true,
            customAttrSurround: [
              [/#/, /(?:)/],
              [/\*/, /(?:)/],
              [/\[?\(?/, /(?:)/]
            ],
            customAttrAssign: [/\)?\]?=/]
          },

        }
      }),
    ],

    /**
     * Webpack Development Server configuration
     * Description: The webpack-dev-server is a little node.js Express server.
     * The server emits information about the compilation state to the client,
     * which reacts to those events.
     *
     * See: https://webpack.github.io/docs/webpack-dev-server.html
     */
    devServer: {
      port              : metadata.port,
      host              : metadata.host,
      historyApiFallback: true,
      watchOptions      : {
        aggregateTimeout: 300,
        poll            : 1000
      },
      outputPath        : targetDir
    },

    /*
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     *
     * See: https://webpack.github.io/docs/configuration.html#node
     */
    node: {
      global        : true,
      crypto        : 'empty',
      fs            : 'empty',  // f. browser build
      net           : 'empty',  // ~
      tls           : 'empty',  // ~
      process       : release ? false : true,
      module        : false,
      clearImmediate: false,
      setImmediate  : false
    }
  }; // config
}; // function

/**
 * package.json holen und buildnumber++ eintragen
 */
function getPackage(package_json, env) {
  // TODO getrennte build-Zaehler f. prod. und dev. ??
  var package = require(package_json);
  if (package) {
    // buildnumber aus package.json holen (default 0)
    var buildnumber = package.buildnumber || 0;
    // +1
    package.buildnumber = ++buildnumber;
    // package.json mit der neuen buildnumber zurueckschreiben
    fs.writeFileSync(package_json, JSON.stringify(package, null, 2));
    return package;
  } else {
    throw "ERROR getting package.json";
  }
}

/* -> compressionPlugin
 function gzipMaxLevel(buffer, callback) {
 return zlib['gzip'](buffer, {level: 9}, callback)
 }
 */
