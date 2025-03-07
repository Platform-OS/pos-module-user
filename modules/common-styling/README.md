vWIP

This module contains reusable CSS and JS, which is or will be leveraged by [platformOS modules](https://documentation.platformos.com/developer-guide/modules/platformos-modules#our-modules), and which you wil be able to use in your projects. The idea is to provide a consistent and documented way of providing modules which look good from a start and which you can easily customize to fit your needs.

This module follows the [platformOS DevKit best practices](https://documentation.staging.oregon.platform-os.com/developer-guide/modules/platformos-modules).

## Installation

The platformOS Common Styling Module is available on the [Partner Portal Modules Marketplace](https://partners.platformos.com/marketplace/pos_modules/154).

### Prerequisites

Before installing the module, ensure that you have [pos-cli](https://github.com/mdyd-dev/pos-cli#overview) installed. This tool is essential for managing and deploying platformOS projects.

The platformOS Common Styling is fully compatible with [platformOS Check](https://github.com/Platform-OS/platformos-lsp#platformos-check----a-linter-for-platformos), a linter and language server that supports any IDE with Language Server Protocol (LSP) integration. For Visual Studio Code users, you can enhance your development experience by installing the [VSCode platformOS Check Extension](https://marketplace.visualstudio.com/items?itemName=platformOS.platformos-check-vscode).

### Installation Steps

1. **Navigate to your project directory** where you want to install the Common Styling Module.

2. **Run the installation command**:

```bash
   pos-cli modules install common-styling
```

This command installs the Common Styling Module and updates or creates the `app/pos-modules.json` file in your project directory to track module configurations.

### Setup

1. **Install the module** using the [pos-cli](https://github.com/Platform-OS/pos-cli).
2. **Import the following CSS files** into your layout's `<head>` section:

```html
<link rel="stylesheet" href="{{ 'modules/common-styling/style/pos-config.css' | asset_url }}">
<link rel="stylesheet" href="{{ 'modules/common-styling/style/pos-button.css' | asset_url }}">
<link rel="stylesheet" href="{{ 'modules/common-styling/style/pos-typography.css' | asset_url }}">
<link rel="stylesheet" href="{{ 'modules/common-styling/style/pos-toast.css' | asset_url }}">
<link rel="stylesheet" href="{{ 'modules/common-styling/style/pos-avatar.css' | asset_url }}">
<link rel="stylesheet" href="{{ 'modules/common-styling/style/pos-forms.css' | asset_url }}">
<link rel="stylesheet" href="{{ 'modules/common-styling/style/pos-page.css' | asset_url }}">
```

3. **Optionally, import the following CSS reset**. It's not recommended to use in on an existing app probably, but you can safely use it on a fresh one. To use it just place the following CSS reference on top and use a `pos-app` class anywhere on your main content container.

```html
<link rel="stylesheet" href="{{ 'modules/common-styling/style/pos-reset.css' | asset_url }}">
```

## Customizing CSS

When using the `common-styling` module you can easiliy configure the looks of components by overwriting the CSS variables stored in `pos-config.css`. Just copy the variables you need to overwrite to the CSS of your app so they can be overwritten.

When building CSS don't hardcode any (well... probably with some exeptions) color or size. Everything should use CSS variables that are in line with [Figma variables](https://documentation.platformos.com/kits/ui/platformos-design-kit#download). (Pro tip - you can use calc(), from-color() or color-mix() if needed).


## Scoping CSS

When naming your module CSS files, please prefix them with `pos-` for coinsistency.

When naming your CSS classes, please prefix those with `pos-`. We are trying to make sure that the CSS from modules won't interfere with any other CSS that could be used in the project. Keep in mind that the module can be used in various contextes so any styling needs to be scoped just to the module code.

Every CSS is placed inside a `common-styling` CSS layer to lower it's specificity and so that you could always easily overwrite them without having to worry about selectors used.

There are some CSS rules that will be inherited when the parent container has a specific class. Example of`.pos-form` class on a container will style the inputs, buttons and form-related stuff inside the container.

Each component should have it's own separate CSS file.


## JavaScript namespace for modules

Use ESM Modules to build JavaScript.

The modules should not pollute the global JavaScript namespace. For this purpose we are using the `pos` namespace attached to global `window` object. Extending the namespace is the preferred way to store all the needed data, translations and module public interface.

There are several basic objects used across the modules that could be extended for consistency. Those are shared across many modules, so **remember not to overwrite them in your code** and extend the objects instead.

| window.pos | Global namespace for all modules-related data. |
| window.pos.modules | If your module provides a public API then you should attach it to this object namespacing your module accordingly `window.pos.module.myModule = {}` |
| window.pos.profile | Stores all the profile-related data for currently logged in user. |
| window.pos.translations | If your JavaScript code needs access to any translations you should append them to this object. |

As an example starting point for defining JavaScript for your module you can use the following code:

```
<script>
  /* namespace */
  if(typeof window.pos !== 'object'){
    window.pos = {};
    window.pos.modules = {};
    window.pos.translations = {};
  }

  /* profile namespace */
  if(typeof window.pos.profile !== 'object'){
    window.pos.profile = {};
  }

  window.pos.profile.myProfileVariable = 'foo';

  /* translations used in module */
  window.pos.translations = {
    ...window.pos.translations,
    myTranslation: 'bar'
  }
</script>
```


## Handling cache with importmaps

When using `import` statement in your JavaScript files, you will request an JS file from the CDN that could be already cached by the browser. PlatformOS handles breaking the cache for assets by using `asset_url` filter. You cannot use it in the JS files though, but the browsers allows you to map any filename to any other URL using [Import Maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap). Currently only a single import map on a page can be used and it needs to be defined before any other JS script. (This will change in the near future as multiple import maps are in the works for all the browsers).

An example import map looks like this:

```
<script type="importmap">
  {
    "imports": {
      "/": "{{ 'modules/chat/js/' | asset_url }}",
      "chat.js": "{{ 'modules/chat/js/chat.js' | asset_url }}",
      "consumer.js": "{{ 'modules/chat/js/consumer.js' | asset_url }}",
      "csrfToken.js": "{{ 'modules/chat/js/csrfToken.js' | asset_url }}",
      "notifications.js": "{{ 'modules/chat/js/notifications.js' | asset_url }}",
      "./": "./"
    }
  }
</script>
```

The first line allows to use relative `import` statements inside your JS files, the last line resets it back to default.


## Components

### Toast notifications

1. Render the partial in your application layout (preferably at the very bottom)
```
{% liquid
  function flash = 'modules/core/commands/session/get', key: 'sflash'
  if context.location.pathname != flash.from or flash.force_clear
    function _ = 'modules/core/commands/session/clear', key: 'sflash'
  endif
  theme_render_rc 'modules/common-styling/toasts', params: flash
%}
```

From JavaScript you can use:
```
new pos.modules.toast('[severity]', '[message]') to show new notification
```

On the server-side:
[TO DO]