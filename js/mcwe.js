//Show and Hide

function showDiv(sDivName) {
  var div = document.getElementById(sDivName);
  div.style.display = 'block';
//  $('divMap').show();
}
function hideDiv(sDivName) {
  var div = document.getElementById(sDivName);
  div.style.display = 'none';
}

function writeEmail(contact, email, emailHost) {
  document.write("<a href=" + "&#109a&#105l" + "&#116&#111:" + email + "@" + emailHost+ ">" + contact + "@" + emailHost+"</a>");
}

// We are using this on the Company.php page for the staff sections. It allows us to
// show or hide a div when the li is clicked. It also toggles the +/- images that are
// defined in the CSS as .collapse and .expand
function expandCollapse(liID, divID, color) {
  //If the DIV is visible (currently it's expanded) then we need to hide (collapse) it and then show the Expand (+) image
  if ($(divID).visible()) {
    $(liID).removeClassName(color+'_expanded').addClassName(color+'_collapsed');
  } else {
    $(liID).removeClassName(color+'_collapsed').addClassName(color+'_expanded');
  }
  Effect.toggle(divID, 'blind', { duration: .3 });
}

//For this to work you have to use an <h3> for the "list item" that's clickable. You also need to apply
//a fake style like "orange_div_expanded" in the HTML to the first DIV that starts off expanded.
var status = new Object;
status["orange"] = "01";
status["blue"] = "01";
status["red"] = "01";
status["green"] = "01";
function expandOneCollapseRest(index, color) {
  //If the DIV is visible (currently it's expanded) then we need to hide (collapse) it and then show the Expand (+) image
  if ($('div_'+color+'_'+index).visible()) {
    //Do nothing - this DIV is already the visible one
  } else {
    //Get the DIV that's currently expanded (it's not this one) and collapse it
//alert("color...");
//alert("color [" + color + "]");
//alert("index...");
//alert("index [" + index + "]");
//alert("item [" + 'h3_'+color+'_'+index + "]");
    var el_id = 'h3_'+color+'_'+status[color];
    var el = $(el_id);
    el = document.getElementById(el_id);
//alert("element:");
//alert(el);
    el.removeClassName(color+'_expanded').addClassName(color+'_collapsed');
    Effect.toggle($('div_'+color+'_'+status[color]), 'blind', { duration: .3, queue:'end' });

    //Expand this DIV now
    $('h3_'+color+'_'+index).removeClassName(color+'_collapsed').addClassName(color+'_expanded');
    Effect.toggle('div_'+color+'_'+index, 'blind', { duration: .3, queue:'end' });

    status[color] = index;
  }
}

//This is used on the home page to show/hide divs that are associated with list items. The divs
//contain the content when the page is loaded so we simply need to show the div for the tab that
//was clicked and hide the div that was visible and toggle the "active_tab" class on the selected
//and deselected tabs.
var visibleTabContent = 'divGeneral';
function switchTabs(ulId, clickedListItem, clickedListItemsDivId) {
  if (!$(clickedListItemsDivId).visible()) {
    $(visibleTabContent).hide();                                             //hide the DIV contents for the old tab
    $(ulId).select('li.active_tab').invoke('removeClassName', 'active_tab'); //remove the "active_tab" class from the old tab
    $(clickedListItem.id).addClassName('active_tab');                        //add the "active_tab" class to the new tab
    $(clickedListItemsDivId).show();                                         //show the DIV contents for the new tab
    visibleTabContent = clickedListItemsDivId;                               //save the name of the active tab for future reference
  }
}

//Portfolio POP UP
function pop(url, name, props) {
	window.open(url, name, props);
}

//Extend the String object so that we can use the trim() function like; sVar.trim();
String.prototype.trim = function() {
  a = this.replace(/^\s+/, '');
  return a.replace(/\s+$/, '');
};

