var keys = ['happy','sad','angry','peace','love','confused','fear','disgust'];
var scores = {};
keys.forEach(function(k) {
  scores[k] = parseInt(sessionStorage.getItem(k)) || 0;
});
var dominant = keys.reduce(function(a, b) {
  return scores[a] > scores[b] ? a : b;
});
var bgMap = {
  happy:    '#f5f0d8',
  sad:      '#d8e4f5',
  angry:    '#f5dbd8',
  peace:    '#c8f0e4',
  love:     '#f5d8e8',
  confused: '#ede0f5',
  fear:     '#ddd8f5',
  disgust:  '#dff0d8'
};
document.addEventListener('DOMContentLoaded', function() {
  document.body.style.backgroundColor = bgMap[dominant];
});