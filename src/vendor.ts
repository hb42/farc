import "core-js/es6";

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
