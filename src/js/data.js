/* Data access -------------------------------------------------------------
 * The canvas definition lives in ../data/*.json so it can be edited without
 * touching any code. In the bundled standalone build those files are inlined
 * as window.RFP_BUNDLED_DATA, so loadData() resolves without a network call.
 */
var CC = {};      // canvas name -> {bg, tx, bd} colour chips
var STEPS = [];   // the 9 canvas steps, each with its requirement list

function loadData() {
  if (window.RFP_BUNDLED_DATA) {
    CC = window.RFP_BUNDLED_DATA.canvasColors;
    STEPS = window.RFP_BUNDLED_DATA.steps;
    return Promise.resolve();
  }
  return Promise.all([
    fetch('data/canvas-colors.json').then(function (r) { return r.json(); }),
    fetch('data/steps.json').then(function (r) { return r.json(); })
  ]).then(function (res) {
    CC = res[0];
    STEPS = res[1];
  });
}
