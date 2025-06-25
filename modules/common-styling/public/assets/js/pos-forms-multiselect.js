/*
  handles the multiselect input

  usage:
    new pos.modules.multiselect(container);
*/



// purpose:		shows the floating alert
// arguments: container with the password input (dom node)
//            settings that will overwrite the default ones (object)
// ************************************************************************
window.pos.modules.multiselect = function(container, settings){

  // cache 'this' value not to be overwritten later
  const module = this;

  // purpose:		settings that are being used across the module
  // ------------------------------------------------------------------------
  module.settings = {};
  // container for the component (dom node)
  module.settings.container = container;
  // id of the input (string)
  module.settings.id = container.id;
  // if the popup is opened (bool)
  module.settings.opened = false;
  // class name to add to container when the popup is opened (string)
  module.settings.openedClass = 'pos-form-multiselect-opened';
  // button that will toggle the popup (dom node)
  module.settings.toggleButton = container.querySelector('.pos-form-input');
  // available options list (dom node)
  module.settings.optionsNode = settings.optionsNode || container.querySelector('.pos-form-multiselect-list');
  // available options (object)
  module.settings.availableOptions = {};
  // currently selected options (array)
  module.settings.selected = [];
  // list of selected items (dom node)
  module.settings.selectedListNode = container.querySelector('.pos-form-multiselect-selected-list');
  // template for selected items (dom node)
  module.settings.selectedTemplate = container.querySelector('.pos-form-multiselect-selected-template');
  // filter input (dom node)
  module.settings.filterInput = container.querySelector('.pos-form-multiselect-filter');
  // class list to add to items that are filtered out
  module.settings.filteredClass = 'pos-form-multiselect-list-item-filtered';
  // class name to add to the container if filtering outputs no results
  module.settings.noResultsClass = 'pos-form-multiselect-filtered-empty';
  // element that counts the combined number of selected options (dom node)
  module.settings.combinedNode = container.querySelector('.pos-form-multiselect-selected-item-combined');
  // button that clears all of the selected options (dom node)
  module.settings.clearNode = container.querySelector('.pos-form-multiselect-clear');
  // if you want to enable debug mode (bool)
  module.settings.debug = false;
  // if at least one option is required to be selected (bool)
  module.settings.required = container.hasAttribute('required');



  // purpose:		initializes the module
  // ------------------------------------------------------------------------
  module.init = () => {
    pos.modules.debug(module.settings.debug, module.settings.id, 'Initializing', module.settings.container);

    // toggle opened class on the container when clicking the input (but not the selected items)
    module.settings.toggleButton.addEventListener('keydown', event => {
      if(event.key === 'Enter' || event.key === ' '){
        if(event.target.matches('.pos-form-multiselect-clear')){
          event.preventDefault();
          module.clear();
          module.settings.toggleButton.focus();
        } else {
          event.preventDefault();
          module.toggle();
        }
      }
    });

    module.settings.toggleButton.addEventListener('click', event => {
      if(!event.composedPath().some(element => element.classList && element.classList.contains('pos-form-multiselect-selected-item'))){
        event.preventDefault();
        module.toggle();
      }
    });

    // prepare the available options list
    module.settings.optionsNode.querySelectorAll('li').forEach(item => {
      const value = item.querySelector('[type="checkbox"]').value;
      const selected = item.querySelector('[type="checkbox"]').checked;
      const label = item.querySelector('label').textContent;
      module.settings.availableOptions[value] = { label: label, selected: selected, value: value };

      // update the selected items with items that are preselected from BE
      if(selected){
        module.add(value);
      }
    });
    
    pos.modules.debug(module.settings.debug, module.settings.id, 'Available options prepared', module.settings.availableOptions);
    pos.modules.debug(module.settings.debug, module.settings.id, 'Preselected items updated', module.settings.selected);

    // react to chagnes in the options list
    module.settings.optionsNode.addEventListener('change', event => {
      if(event.target.matches('input[type="checkbox"]')) {
        if(module.settings.selected.includes(event.target.value)){
          module.remove(event.target.value);
        } else {
          module.add(event.target.value);
        }

        pos.modules.debug(module.settings.debug, module.settings.id, 'Currently selected items', module.settings.selected);
      }
    });

    // react to filtering the list
    if(module.settings.filterInput){
      module.settings.filterInput?.addEventListener('input', event => {
        module.filter(event.target.value);
      });
    }

    // clearing all the options
    if(module.settings.clearNode){
      module.settings.clearNode.addEventListener('click', () => {
        module.clear();
      });
    }

    // report validity
    if(module.settings.optionsNode.querySelector('[type="checkbox"]').form && module.settings.required){
      module.settings.optionsNode.querySelector('[type="checkbox"]').form.addEventListener('submit', event => {
        const options = module.settings.optionsNode.querySelectorAll('[type="checkbox"]');

        if(module.settings.optionsNode.querySelectorAll(':checked').length === 0){
          event.preventDefault();
          module.open();
          module.settings.toggleButton.setAttribute('aria-invalid', true);
          options[0].setCustomValidity('At least one option must be choosen');
          options[0].reportValidity();
        } else {
          module.settings.toggleButton.removeAttribute('aria-invalid');
        }
      });
    }
  };


  // purpose:		opens the popup
  // output:    adds class to the container and sets the bool variable
  // ------------------------------------------------------------------------
  module.open = () => {
    module.settings.container.classList.add(module.settings.openedClass);
    module.settings.opened = true;
    module.settings.toggleButton.setAttribute('aria-expanded', true);

    document.addEventListener('keydown', module.reactToEscape);
    document.addEventListener('click', module.reactToClickOutside);
    document.addEventListener('focusin', module.reactToFocusOutside);

    pos.modules.debug(module.settings.debug, module.settings.id, 'Popup opened');
  };


  // purpose:		closes the popup
  // output:    removes class to the container and sets the bool variable
  // ------------------------------------------------------------------------
  module.close = () => {
    module.settings.container.classList.remove(module.settings.openedClass);
    module.settings.opened = false;
    module.settings.toggleButton.setAttribute('aria-expanded', false);

    document.removeEventListener('keydown', module.reactToEscape);
    document.removeEventListener('click', module.reactToClickOutside);
    document.removeEventListener('focusin', module.reactToFocusOutside);

    // clean the filter input
    if(module.settings.filterInput){
      module.settings.filterInput.value = '';
      module.filter('');
    }

    pos.modules.debug(module.settings.debug, module.settings.id, 'Popup closed');
  };


// purpose:		event handler that closes the popup when esacpe key is pressed
// arguments: event object (dom event)
// ------------------------------------------------------------------------
  module.reactToEscape = event => {
    if(event.key === 'Escape'){
      pos.modules.debug(module.settings.debug, module.settings.id, 'Escape key pressed, closing the multiselect popup');

      module.close();
      module.settings.toggleButton.focus();
    }
  };


// purpose:		event handler that closes the popup when clicked outside of it
// arguments: event object (dom event)
// ------------------------------------------------------------------------  
  module.reactToClickOutside = event => {
    if(!event.composedPath().includes(module.settings.container)){
      pos.modules.debug(module.settings.debug, module.settings.id, 'Clicked outside the multiselect, closing the popup');

      module.close();
    }
  };


// purpose:		event handler that closes the popup when clicked outside of it
// arguments: event object (dom event)
// ------------------------------------------------------------------------  
  module.reactToFocusOutside = event => {
    if(!container.contains(event.target)){
      pos.modules.debug(module.settings.debug, module.settings.id, 'Focused outside the multiselect, closing the popup');

      module.close();
    }
  };


  // purpose:		toggles the popup
  // output:    toggles the class on the container and sets the bool variable
  // ------------------------------------------------------------------------
  module.toggle = () => {
    if(module.settings.opened){
      module.close();
    } else {
      module.open();
    }
  };
  
  
  // purpose:		add an item to the selected items list
  // arguments: value to be added (string)
  // output:    updates module.settings.selected and updates the UI
  // ------------------------------------------------------------------------
  module.add = (value) => {
    module.settings.selected.push(value);
    pos.modules.debug(module.settings.debug, module.settings.id, `Added to selected items: ${value}`);

    const item = module.settings.selectedTemplate.content.cloneNode(true);

    item.querySelector('.pos-form-multiselect-selected-item-remove').htmlFor = `pos-multiselect-${module.settings.id}-${value}`;
    item.querySelector('.pos-form-multiselect-selected-item-remove .pos-button-label').textContent += ` '${module.settings.availableOptions[value].label}'`;
    item.querySelector('.pos-form-multiselect-selected-item-label').textContent = module.settings.availableOptions[value].label;

    module.updateCounter();
    module.settings.selectedListNode.append(item);

    pos.modules.debug(module.settings.debug, module.settings.id, `Showed in the input: ${module.settings.availableOptions[value].label}`);
  };


  // purpose:		removes an item from the selected items list
  // arguments: value to be removed (string)
  // output:    updates module.settings.selected and updates the UI
  // ------------------------------------------------------------------------
  module.remove = (value) => {
    module.settings.selected = module.settings.selected.filter(item => item !== value);
    pos.modules.debug(module.settings.debug, module.settings.id, `Removed from selected items: ${value}`);

    module.settings.selectedListNode.querySelector(`.pos-form-multiselect-selected-item-remove[for="pos-multiselect-${module.settings.id}-${value}"]`).closest('.pos-form-multiselect-selected-item').remove();
    pos.modules.debug(module.settings.debug, module.settings.id, `Removed from the input: ${module.settings.availableOptions[value].label}`);

    module.updateCounter(); 
  };


  // purpose:		updates the selected number counter (used with combine_selected option)
  // output:    updates the UI
  // ------------------------------------------------------------------------
  module.updateCounter = () => {
    if(module.settings.combinedNode){
      module.settings.combinedNode.querySelector('i').textContent = module.settings.selected.length;
    }

    pos.modules.debug(module.settings.debug, module.settings.id, `Updated the counter of selected items to ${module.settings.selected.length}`);
  };


  // purpose:		clears all selected items
  // output:    updates the UI and unchecks all the checkboxes
  // ------------------------------------------------------------------------
  module.clear = () => {
    module.settings.optionsNode.querySelectorAll('[type="checkbox"]').forEach(element => {
      element.checked = false;
    });
    module.settings.selected = [];
    module.settings.selectedListNode.replaceChildren();
    module.updateCounter();

    pos.modules.debug(module.settings.debug, module.settings.id, `Cleared all of the selected items`);
  };


  // purpose:		filters dom nodes by given phrase
  // arguments: phrase to filter by (string)
  // output:    adds a class to each item that does not match the phrase
  //            and adds a class to the container if no results are found
  // ------------------------------------------------------------------------
  module.filter = (phrase) => {
    phrase = phrase.toLowerCase();

    const allItems = module.settings.optionsNode.querySelectorAll('li');

    allItems.forEach(item => {
      const label = item.querySelector('label').textContent.toLowerCase();
      if(label.includes(phrase)){
        item.classList.remove(module.settings.filteredClass);
      } else {
        item.classList.add(module.settings.filteredClass);
      }
    });

    if(allItems.length === module.settings.optionsNode.querySelectorAll(`.${module.settings.filteredClass}`).length){
      module.settings.container.classList.add(module.settings.noResultsClass);
    } else {
      module.settings.container.classList.remove(module.settings.noResultsClass);
    }

    pos.modules.debug(module.settings.debug, module.settings.id, `Filtered options by phrase: ${phrase}`);
  };


  // purpose:		checks if at least one option is selected when required
  // output:    triggers default browser form validation
  // ------------------------------------------------------------------------
  module.validate = () => {
    const checkboxes = module.settings.optionsNode.querySelectorAll('[type="checkbox"]');

    checkboxes.setCustomValidity(checkboxes.querySelector('input:checked').length === 0 ? 'Choose one' : '');
  };



  module.init();

};