/* Bootstrap: welcome screen, top-bar actions, render loop */

function refresh() {
  renderSB();
  if (S.view === 'steps') renderStep(S.step);
}


function showApp() {
  document.getElementById('rfpWelcome').style.display = 'none';
  document.getElementById('rfpApp').style.display = '';
}

function showWelcome() {
  document.getElementById('rfpApp').style.display = 'none';
  document.getElementById('rfpWelcome').style.display = '';
}

function startReading() {
  document.getElementById('engIn').value = document.getElementById('wEngIn').value;
  document.getElementById('arcSel').value = document.getElementById('wArcSel').value;
  showApp();
  goStep(STEPS[0].id);
}

function newRFP() {
  if (!confirm('Clear all selections and start a new RFP?')) return;
  resetState();
  ['engIn', 'arcSel', 'wEngIn', 'wArcSel'].forEach(function (id) {
    document.getElementById(id).value = '';
  });
  document.getElementById('sv').style.display = '';
  document.getElementById('sumv').style.display = 'none';
  showWelcome();
  refresh();
}

function init() {
  document.getElementById('btnSum').addEventListener('click', showSum);
  document.getElementById('btnNew').addEventListener('click', newRFP);
  document.getElementById('wStartBtn').addEventListener('click', startReading);
  document.getElementById('wEngIn').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('wStartBtn').click();
  });
  refresh();
}

loadData().then(init).catch(function (err) {
  document.getElementById('sv').innerHTML =
    '<div class="sh"><div class="stit">Could not load the canvas data</div>' +
    '<div class="sdsc">' + err + '</div></div>';
});
