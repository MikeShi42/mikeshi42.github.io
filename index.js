//Handles scroll events, fired after short delay after last scroll event
function scrollHandler(){
  if(scrollTop() > 250){
    sectionElements.nav.classList.add('default');
  }
  else{
    sectionElements.nav.classList.remove('default');
  }
}

var projects = [
  {
    'name': 'Pandora Extensions',
    'image-url': 'http://michaelshi.me/wp-content/uploads/2013/12/pandoraextensionsIconNoBG.png'
  }, 
  {
    'name': 'ScorePortal',
    'image-url': 'http://michaelshi.me/wp-content/uploads/2013/12/spIconNoBG.png'
  },
  {
    'name': 'Tumblr Paper',
    'image-url': 'http://michaelshi.me/wp-content/uploads/2013/12/tumblrPaperIconNoBG.png'
  },
  {
    'name': 'Tumblr Paper',
    'image-url': 'http://michaelshi.me/wp-content/uploads/2013/12/tumblrPaperIconNoBG.png'
  }


];

projectListings();

function projectListings(){
  var projectCards = document.getElementsByClassName('project-card');
  for(var i=0; i<projectCards.length; i++){
    console.log(projects[i]['image-url']+' ');
    projectCards[i].getElementsByClassName('image')[0].style.backgroundImage = 'url('+ projects[i]['image-url'] +')';
    //'url("https://www.google.com/images/srpr/logo11w.png")';
  }
}


//Shortcut for section elements
var sectionElements = {
  'nav': document.getElementsByClassName('navbar')[0],
  'landing': document.getElementsByClassName('landing')[0],
  'projects': document.getElementsByClassName('projects')[0]
}

//Scroll watcher
//Derived from: http://stackoverflow.com/questions/7392058/more-efficient-way-to-handle-window-scroll-functions-in-jquery
var scrollTimer = null;
document.onscroll = function(){
  if(scrollTimer)
    clearTimeout(scrollTimer);
  scrollTimer = setTimeout(scrollHandler, 15);
}

