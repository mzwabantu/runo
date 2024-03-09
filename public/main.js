
const articlesGrid = document.querySelector('.articles');
if(articlesGrid) isotope();

function isotope() {
  // init Isotope
  const iso = new Isotope( '.articles', {
    itemSelector: '.article-item',
    layoutMode: 'fitRows'
  });

  // bind filter button click
  const filtersElem = document.querySelector('.article-filters');
  if(filtersElem) {
    filtersElem.addEventListener( 'click', function( event ) {
      // only work with buttons
      if ( !matchesSelector( event.target, 'button' ) ) {
        return;
      }
      var filterValue = event.target.getAttribute('data-filter');
      // use matching filter function
      filterValue = filterValue;
      iso.arrange({ filter: filterValue });
    });
  }

  // change is-checked class on buttons
  const buttonGroups = document.querySelectorAll('.button-group');
  if(buttonGroups) {
    for ( var i=0, len = buttonGroups.length; i < len; i++ ) {
      var buttonGroup = buttonGroups[i];
      radioButtonGroup( buttonGroup );
    }
  }

  function radioButtonGroup( buttonGroup ) {
    buttonGroup.addEventListener( 'click', function( event ) {
      // only work with buttons
      if ( !matchesSelector( event.target, 'button' ) ) {
        return;
      }
      buttonGroup.querySelector('.text-primary').classList.remove('text-primary');
      event.target.classList.add('text-primary');
    });
  }

}

function search() {
  alert("...searching...")
}

function switchPanel() {
  document.getElementById('authForm').classList.toggle('login');
}
  