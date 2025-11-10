// JavaScript Document - vanilla JS loader

document.addEventListener('DOMContentLoaded', function() {
  loadInto('#menu', 'Menu.html');
  loadInto('#insidemenu', 'InsideMenu.html');
});

function loadInto(selector, url) {
  var el = document.querySelector(selector);
  if (!el) return;
  fetch(url).then(function(resp){
    if (!resp.ok) throw new Error('Failed to load ' + url + ' (' + resp.status + ')');
    return resp.text();
  }).then(function(html){
    el.innerHTML = html;
  }).catch(function(err){
    console.error(err);
  });
}

