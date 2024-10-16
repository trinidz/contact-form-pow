window.onload = () => {
  timePreferenceDefault()
}

//clear form after submission
window.onbeforeunload = () => {
  for(const form of document.getElementsByTagName('form')) {
    form.reset();
  }
  timePreferenceDefault()
}

function timePreferenceDefault() {
  document.getElementById('radBtn9AM_1').disabled = false
  document.getElementById('radBtn9AM_1').checked = true

  document.getElementById('radBtn12PM_1').disabled = false
  document.getElementById('radBtn12PM_1').checked = false

  document.getElementById('radBtn4PM_1').disabled = false
  document.getElementById('radBtn4PM_1').checked = false
}
