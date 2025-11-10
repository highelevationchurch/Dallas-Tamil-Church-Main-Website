// JavaScript Document - vanilla JS loader and submenu handling

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
    // After inserting HTML, initialize submenu behavior for this content
    initSubmenus(el);
  }).catch(function(err){
    console.error(err);
  });
}

function initSubmenus(root) {
  root = root || document;

  // Ensure submenus are hidden initially
  root.querySelectorAll('.dropdown-submenu .dropdown-menu').forEach(function(sm){
    sm.style.display = 'none';
  });

  // Toggle submenu display when its parent link is clicked
  root.querySelectorAll('.dropdown-submenu > a').forEach(function(a){
    a.addEventListener('click', function(e){
      var submenu = a.nextElementSibling;
      if (!submenu || !submenu.classList.contains('dropdown-menu')) return;
      e.preventDefault();
      e.stopPropagation();

      // hide other open submenus at the same level
      var parentMenu = a.closest('.dropdown-menu');
      if (parentMenu) {
        parentMenu.querySelectorAll('.dropdown-menu').forEach(function(m){
          if (m !== submenu) m.style.display = 'none';
        });
      }

      submenu.style.display = (submenu.style.display === 'block') ? 'none' : 'block';
    });
  });

  // Clicking anywhere outside dropdowns closes all submenus
  document.addEventListener('click', function(e){
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown-submenu .dropdown-menu').forEach(function(sm){
        sm.style.display = 'none';
      });
    }
  });

  // When a top-level dropdown toggle is clicked, hide submenus in other dropdowns.
  root.querySelectorAll('.dropdown > .dropdown-toggle').forEach(function(toggle){
    toggle.addEventListener('click', function(){
      setTimeout(function(){
        document.querySelectorAll('.dropdown-submenu .dropdown-menu').forEach(function(sm){
          var openDropdown = document.querySelector('.dropdown.open');
          if (openDropdown && openDropdown.contains(sm)) return;
          sm.style.display = 'none';
        });
      }, 250);
    });
  });
}

