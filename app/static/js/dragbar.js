//https://stackoverflow.com/questions/6219031/how-can-i-resize-a-div-by-dragging-just-one-side-of-it
let dragging = 0
body = document.body

function clearJSEvents() {
  dragging = 0;
  body.removeEventListener("mousemove", resize);
  body.classList.remove('resizing');
}

function resize(e) {
  body.style.setProperty("--left-width", e.pageX + 'px');
  //fit the terminal
  f.fit();
  
}
/* This is defined in server.js
target.onmousedown = function(e) {
  e.preventDefault();
  dragging = 1;
  body.addEventListener('mousemove', resize);
  body.classList.add('resizing');
};
*/

document.onmouseup = function() {
  dragging ? clearJSEvents() : '';
};