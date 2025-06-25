/*
  handles showing the floating notifications

  usage:
    new window.pos.modules.toast('type', 'message');
    or
    let notification = new window.pos.modules.toast('type', 'message')
    notification.remove();

  types:
    error
    success
    info
*/



// purpose:		shows the floating alert
// arguments: type of the message (string)
//            the message to show (string)
//            settings to overwrite the defaults (object)
// ************************************************************************
window.pos.modules.toast = function(type, message, userSettings){

  // cache 'this' value not to be overwritten later
  const module = this;

  // purpose:		settings that are being used across the module
  // ------------------------------------------------------------------------
  module.settings = {};
  // notifications container (dom node)
  module.settings.container = document.querySelector('#pos-toasts');
  // id used to mark the module (string)
  module.settings.id = 'toast'
  // the html template to be used for notifications (dom node)
  module.settings.template = module.settings.container.querySelector('#pos-toast-template');
  // the selector for the text content in the template (string)
  module.settings.contentSelector = '.pos-toast-content';
  // the selector for the button that closes the notification (string)
  module.settings.closeSelector = '.pos-toast-close';
  // the notification in dom (dom object)
  module.settings.notification = null;
  // if you want to overwrite the default autohide (bool)
  module.settings.autohide = (userSettings?.autohide !== undefined) ? userSettings.autohide : (type === 'success') ? true : false;
  // if you want a delay before the notification appears, miliseconds (int)
  module.settings.delay = (userSettings?.delay) ? userSettings.delay : false;
  // to enable debug mode (bool)
  module.settings.debug = (userSettings?.debug) ? userSettings.debug : false;

  let autoHideTimeout = null;



  // purpose:		initializes the component
  // ------------------------------------------------------------------------
  module.init = () => {
    pos.modules.debug(module.settings.debug, module.settings.id, 'Initializing', module.settings.container);

    if(module.settings.delay){
      setTimeout(() => {
        module.show();
      }, module.settings.delay);
    } else {
      module.show();
    }

    // auto hide the message when it is a success
    if(module.settings.autohide){
      autoHideTimeout = setTimeout(() => {
        module.hide();
      }, (module.settings.debug) ? 700 : 5000);
    }

  };


  // purpose:		shows the notification
  // ------------------------------------------------------------------------
  module.show = () => {
    // clone the template
    module.settings.notification = module.settings.template.content.firstElementChild.cloneNode(true);

    // add class corresponding to the severity
    module.settings.notification.classList.add(`pos-toast-${type}`);

    // apply the message to content
    module.settings.notification.querySelector(module.settings.contentSelector).innerHTML = message;

    // set the option to close notification when clicking on close button
    module.settings.notification.querySelector(module.settings.closeSelector).addEventListener('click', () => {
      module.hide();
    }, {once: true});

    // add the class that will animate the appearing
    module.settings.notification.classList.add('pos-toast-loading');

    // when we append the template to the container we are loosing the reference so we need to get it back
    module.settings.notification = module.settings.container.appendChild(module.settings.notification);

    pos.modules.debug(module.settings.debug, module.settings.id, `Showed toast notification, type: ${type}, message: ${message}`);
  };


  // purpose:		hides the notification
  // ------------------------------------------------------------------------
  module.hide = () => {
    // we don't need the autohide feature anymore
    clearTimeout(autoHideTimeout);

    // add a class that will animate removing the node
    module.settings.notification.classList.add('pos-toast-unloading');

    // remove the node from DOM as it's not needed anymore
    module.settings.notification.addEventListener('animationend', () => {
      module.settings.notification.remove();
    });

    pos.modules.debug(module.settings.debug, module.settings.id, `Hidden and removed toast notification, type: ${type}, message: ${message}`);
  };


  module.init();

};

document.dispatchEvent(new Event('pos-modules-toast-ready'));
