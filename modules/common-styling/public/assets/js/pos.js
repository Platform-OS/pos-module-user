/*
  builds the needed namespace for platformOS ready-made components
*/



// purpose:		creates global namespace for all pos related modules
// ------------------------------------------------------------------------
if(typeof window.pos !== 'object'){
  // global namespace
  window.pos = {};
  // modules classes should go here
  window.pos.modules = {};
  // active instances of modules should go here
  window.pos.modules.active = {};
  // translations that needs to be used in JS can be outputted here from liquid
  window.pos.translations = {};
  // enables debug mode on all the modules
  window.pos.debug = false;
}


// purpose:		debuging method that outputs data into the console
// arguments: should the function run (bool)
//            id of the module for which the debug data is printed (string)
//            textual information about what is happening (string)
//            optional data printed and parsed in the console (any)
// ------------------------------------------------------------------------
pos.modules.debug = (active, moduleId, information, data = '') => {
  if(active || pos.debug){
  
    const stringToColor = (string, saturation = 100, lightness = 80) => {
      let hash = 0;
      for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
        hash = (hash & hash) * 100;
      }
      return `hsl(${(hash % 360)}, ${saturation}%, ${lightness}%)`;
    }

    console.log(`%c${moduleId}%c ${information}`, `padding: .2em .5em; background-color: ${stringToColor(moduleId)}; border-radius: 4px;`, 'all: revert;', data);
  }
}