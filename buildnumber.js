/**
 * Created by hb on 08.04.17.
 */

var fs = require('fs');

/**
 * package.json holen und buildnumber++ eintragen
 */
  // TODO getrennte build-Zaehler f. prod. und dev. ??

var package_json = process.cwd() + "/package.json";
var package = require(package_json);
if (package) {
  // buildnumber aus package.json holen (default 0)
  var buildnumber = package.buildnumber || 0;
  package.buildnumber = ++buildnumber;
    // package.json mit der neuen buildnumber zurueckschreiben
  fs.writeFileSync(package_json, JSON.stringify(package, null, 2));
} else {
  throw "ERROR buildnumber.js: could not find " + package_json;
}
