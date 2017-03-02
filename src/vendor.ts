import "core-js/es6";
// import "core-js/es6/array";
// import "core-js/es6/date";
// import "core-js/es6/function";
// import "core-js/es6/map";
// import "core-js/es6/math";
// import "core-js/es6/number";
// import "core-js/es6/object";
// import "core-js/es6/parse-float";
// import "core-js/es6/parse-int";
// import "core-js/es6/reflect";
// import "core-js/es6/regexp";
// import "core-js/es6/set";
// import "core-js/es6/string";
// import "core-js/es6/symbol";
// import "core-js/es6/typed";
// import "core-js/es6/weak-map";
// import "core-js/es6/weak-set";
// // see issue https://github.com/AngularClass/angular2-webpack-starter/issues/709
// // import 'core-js/es6/promise';

import "core-js/es7/reflect";
// import "zone.js/dist/long-stack-trace-zone"; // evtl. nur f. development (z.Zt. Prob.)
import "zone.js/dist/zone";

// Typescript emit helpers polyfill
import "ts-helpers";

// RxJS
// import "rxjs";
// RxJS
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";
import "rxjs/Observable";

// Bootstrap (hat Abhaengigkeit zu jQuery)
import "jquery";

// Angular 2
import "@angular/common";
import "@angular/core";
import "@angular/forms";
import "@angular/http";
import "@angular/platform-browser";
import "@angular/router";

// primeNG
import "primeng/primeng";

// CSS primeNG
import "../node_modules/primeng/resources/primeng.css";
import "../node_modules/primeng/resources/themes/bootstrap/theme.css";

import "@hb42/lib-client";
