// no conflicts with other frameworks
var $j = jQuery.noConflict();

// setup profiles for various popups
var profiles = {
	blank:{height:800,width:800,status:1,toolbar:1},
	window200:{height:200,width:200,status:1,resizable:0},
	windowCenter:{height:300,width:400,center:1}
};

  $j(document).ready(function(){
    //Setup the main rotator on the home page
	$j('.featured').animate({
	  opacity: .8
	});

    $j('#divRotator').cycle({
      timeout:	2000,
	  pause:	1,
      pager:    '#rotatorNumberedMenu'
    });
  });

$j(document).ready(function() {
    $j('#featured-list').jcarousel({
        // Configuration goes here
    	auto: 4,
  		wrap: "both"
    });
});

//
// window.onload function to setup various javascripts
//
