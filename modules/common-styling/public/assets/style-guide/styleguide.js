/*
  handling various aspects of the style guide
  that can be found under /style-guide
*/



// purpose:   the main style guide namespace
// ************************************************************************
const posStyleGuide = function(){

  // cache 'this' value not to be overwritten later
  const module = this;

  // purpose:		initializes the module
  // ------------------------------------------------------------------------
  module.init = () => {
    posStyleGuide.colors();
  };

  module.init();
  
};



// purpose:		handles the color section
// ************************************************************************
posStyleGuide.colors = () => {
  
  // cache 'this' value not to be overwritten later
  const module = this;

  // purpose:		settings that are being used across the module
  // ------------------------------------------------------------------------
  module.settings = {};
  // the container with the colors (dom node)
  module.settings.container = document.querySelector('#colors');
  // the list with the properties color (dom nodes)
  module.settings.propertiesList = module.settings.container.querySelectorAll('.styleguide-color-container');
  // icons (dom nodes)
  module.settings.iconNodes = document.querySelectorAll('#icons svg');


  // purpose:   initializes module
  // ------------------------------------------------------------------------
  module.init = () => {
    module.showBackgroundColor();
    module.showFontDetails();
    module.showHeadingsDetails();
    module.copyCode();
    module.wrapIcons();
    module.showIconNames();
    module.copyIcon();
  };


  // purpose:		convert the color from rgb[a] to hex
  // arguments: color in rgb[a]
  // returns:   color in hex
  // ------------------------------------------------------------------------
  function rgbaToHex(color){
    // skip if already in hex
    if(color.indexOf('#') != -1) return color;
    // skip for more advanced color functions using 
    if(color.indexOf('rgb') != 0) return false;

    color = color
                .replace('rgba', '')
                .replace('rgb', '')
                .replace('(', '')
                .replace(')', '');
    color = color.split(',');

    return  '#'
            + ( '0' + parseInt(color[0], 10).toString(16) ).slice(-2)
            + ( '0' + parseInt(color[1], 10).toString(16) ).slice(-2)
            + ( '0' + parseInt(color[2], 10).toString(16) ).slice(-2);
  }


  // purpose:		finds the background color and shows it in corresponding place
  // ------------------------------------------------------------------------
  module.showBackgroundColor = () => {
    module.settings.propertiesList.forEach(element => {
      element.querySelector('.styleguide-color-hex').textContent = rgbaToHex(window.getComputedStyle(element.querySelector('.styleguide-color')).getPropertyValue('background-color')) || '';
    });
  };


  // purpose:		prints the fonts details
  // ------------------------------------------------------------------------
  module.showFontDetails = () => {
    document.querySelectorAll('#fonts .styleguide-typography-content-family').forEach(element => {
      element.textContent = window.getComputedStyle(element.closest('div').querySelector('.styleguide-fonts-example strong')).getPropertyValue('font-family');
    });
    document.querySelectorAll('#fonts .styleguide-typography-content-size').forEach(element => {
      element.textContent = window.getComputedStyle(element.closest('div').querySelector('p')).getPropertyValue('font-size');
    });
  };


  // purpose:		prints the headings details
  // ------------------------------------------------------------------------
  module.showHeadingsDetails = () => {
    document.querySelectorAll('#headings .styleguide-details, #text-styles .styleguide-details').forEach(element => {
      const headingComputedStyle = window.getComputedStyle(element.closest('.styleguide-columns').querySelector('.styleguide-example'));
      
      element.querySelector('.styleguide-typography-content-family').textContent = headingComputedStyle.getPropertyValue('font-family');
      element.querySelector('.styleguide-typography-content-color').innerHTML = `<span class="styleguide-typography-swatch"></span><span class="styleguide-typography-color">${headingComputedStyle.getPropertyValue('color')}</span> <span class="styleguide-typography-color">${rgbaToHex(headingComputedStyle.getPropertyValue('color'))}</span>`;
      element.querySelector('.styleguide-typography-swatch').style.backgroundColor = headingComputedStyle.getPropertyValue('color');
      element.querySelector('.styleguide-typography-content-size').textContent = headingComputedStyle.getPropertyValue('font-size'); + '(' +  + ')';
      element.querySelector('.styleguide-typography-content-weight').textContent = headingComputedStyle.getPropertyValue('font-weight');
      element.querySelector('.styleguide-typography-content-lineheight').textContent = headingComputedStyle.getPropertyValue('line-height');
    });
  };


  // purpose:		adds 'copy code' button to the code examples
  // ------------------------------------------------------------------------
  module.copyCode = () => {
    // copy button template to be appened to each code examples (dom node)
    const copyButton = document.querySelector('#styleguide-copy');
    // class name to toggle when the code is copied (string)
    const doneButtonClass = 'styleguide-copy-done';


    document.querySelectorAll('.styleguide-code').forEach(element => {
      element.appendChild(copyButton.content.cloneNode(true));

      element.addEventListener('click', event => {
        // text to copy to the clipboard (string)
        const text = element.parentElement.querySelector('pre code').textContent.trim();

        // copy code to clipboard
        navigator.clipboard.writeText(text).then(() => {
          event.target.classList.add(doneButtonClass);

          // remove the class after some time
          setTimeout(() => {
            event.target.classList.remove(doneButtonClass);
          }, 800);
        });
      });
    });
  }


  // purpose:		wrap icons in list elements
  // ------------------------------------------------------------------------
  module.wrapIcons = () => {

    module.settings.iconNodes.forEach(item => {
      let wrapper = document.createElement('li');

      wrapper.classList.add('flex', 'flex-col', 'items-center', 'cursor-pointer');

      item.parentNode.insertBefore(wrapper, item);
      wrapper.appendChild(item);
    });

  };


  // purpose:		show icon names
  // ------------------------------------------------------------------------
  module.showIconNames = () => {
    
    module.settings.iconNodes.forEach(item => {
      item.insertAdjacentHTML('afterend', item.getAttribute('data-icon'));
    });

  };


  // purpose:   copies the icon render function to clipboard on click
  // ------------------------------------------------------------------------
  module.copyIcon = () => {
    module.settings.iconNodes.forEach(icon => {
      icon.parentElement.addEventListener('click', () => {
        let name = icon.getAttribute('data-icon');

        navigator.clipboard.writeText(`{% render 'modules/common-styling/icon', icon: '${name}' %}`).then(() => {
          icon.parentElement.classList.add('styleguide-icon-copied');

          setTimeout(() => {
            icon.parentElement.classList.remove('styleguide-icon-copied');
          }, 800);
        }, () => {
          new Error('Could not copy the code to clipboard');
        });
      });
    });
  };



  module.init();
};



new posStyleGuide();