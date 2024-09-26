# User Module

This module acts as a starting point to add authentication and RBAC authorization to your application. Before using the module for the first time, you might want to go through [User Authentication basics](https://documentation.staging.oregon.platform-os.com/get-started/build-your-first-app/user-authentication) official platformOS documentation.

This module follows [platformOS DevKit best practices](https://documentation.staging.oregon.platform-os.com/developer-guide/modules/platformos-modules) and adds [the core module](https://github.com/Platform-OS/pos-module-core) as a dependency to be able to follow patterns like [Commands](https://github.com/Platform-OS/pos-module-core?tab=readme-ov-file#commands--business-logic) and [Events](https://github.com/Platform-OS/pos-module-core?tab=readme-ov-file#events).

You might want to read about the [built-in User](https://documentation.platformos.com/developer-guide/users/user) table, about [How platformOS manages Sessions](https://documentation.platformos.com/developer-guide/users/session) and high-level overview of [built-in Authentication Strategies in platformOS](https://documentation.platformos.com/developer-guide/users/authentication)

## Setup

1. First, install the module using the [pos-cli](https://github.com/Platform-OS/pos-cli).
2. Configure [components](https://github.com/Platform-OS/pos-module-components) theme paths by creating/adding to [app/config.yml](/developer-guide/platformos-workflow/directory-structure/config) the following `theme_search_paths` property:

```yml
theme_search_paths:
  - modules/user
```
3. Overwrite default views by following [overwriting a module file guide](https://documentation.platformos.com/developer-guide/modules/modules#overwritting-a-module-file).


### Troubleshoot

> There is an error about missing partial `Liquid error: can't find partial "components/molecules/pagetitle". url: my-application.staging.oregon.platform-os.com/users/new page: users/new`

This is because the [app/config.yml](/developer-guide/platformos-workflow/directory-structure/config) has not been configured per the instructions, you have to configure `theme_search_paths` in the `app/config.yml` :

```yml
theme_search_paths:
  - modules/user
```

## Functionality provided by the user module:

- [x] [Registration](#crud-endpoints-including-registration) - provides CRUD commands for the users and implements endpoints for the registration (located in `modules/user/public/views/pages/users/` directory)
- [x] [Session based authentication](#session-based-authentication) - Sign In form / Sign Out
- [x] [Reset password](#reset-password) (NOTE: staging environment requires [additional configuration to send email](https://documentation.platformos.com/get-started/build-your-first-app/sending-email-notifications#enabling-emails-on-the-staging-instance))- endpoints are defined in  `modules/user/public/views/pages/passwords/`
- [x] [RBAC Authorization](#rbac-authorization)

TODO:

- [ ] 2FA authentication through [displaying OTP secret QR code](https://documentation.platformos.com/api-reference/graphql/common/objects/otp) and [OTP verification](https://documentation.platformos.com/api-reference/graphql/common/objects/authenticate)
- [ ] mandatory email verification (as a feature flag)
- [ ] mandatory sms verification (as a feature flag)
- [ ] creating and integrating OAuth module
- [ ] [JWT authentication](https://documentation.platformos.com/api-reference/graphql/common/objects/authenticate)
- [ ] built-in captcha protection

### Registration

The module by itself is functional and you do not require to modify it in order to have a working registration process. The module provides the following commands which provide a basic CRUD for the [User](https://documentation.platformos.com/developer-guide/users/user) built-in platformOS object.

#### CRUD commands 

You can create:

```
function result = 'modules/user/commands/user/create', email: 'admin@example.com', password: 'password'
```

load:

```
function user = 'modules/user/queries/user/load', id: '1'
```

update:

```
function user = 'modules/user/queries/user/update', id: '1', email: 'admin@example.com', password: 'password'
```

and delete:

```
function result = 'modules/user/commands/user/delete', id: '1'
```

#### Endpoints for the registration

There are default REST handlers to display a registration form (`GET /users/new`) and create a User (`POST /users`). They are defined in `modules/user/public/views/pages/users` - this follows the [Resourceful routes naming convention](https://documentation.platformos.com/developer-guide/modules/platformos-modules#resourceful-route-naming-convention). You can modify the redirect path with a param called `redirect_to` or you can set `redirect_to` in `hook_user_create` hook. Example code that redirects a user to `/admin` endpoint if they have `admin_pages.view` permission:

#### Assigning roles to users during registration

The `modules/user/commands/user/create` will set role `superadmin` to the first User that registers. 

The `POST /users` endpoint defined in `modules/user/public/views/pages/users/create.liquid` will assign a role `member` to a user without an existing role.

### Session based authentication

#### Log in using email and password

You can log the user in (which [creates a new session](https://documentation.platformos.com/developer-guide/users/session#security)):

```
function res = 'modules/user/commands/session/create', email: 'email@example.com', password: 'password'
```

This command fires `hook_user_login` hooks.

#### Log out

You can destroy a user session (which will log out the user) by invoking the following command:

```
function res = 'modules/user/commands/session/destroy'
```

It will fire `hook_user_logout` hooks.

#### Log in without password validation 

It's possible to skip the password validation and just create a session and fire `hook_user_login` by setting `validate_password` boolean argument to `false` when calling `modules/user/sessions/create` command. In this case `user_id` argument must be provided.

```
function res = 'modules/user/commands/session/create', user_id: '1', validate_password: false
```

#### Endpoints for sign in / sign out

There are default REST handlers to display a login form (`GET /sessions/new`), create (`POST /sessions`) or destroy (`DELETE /sessions`) a session defined in `modules/user/public/views/pages/sessions` - this follows the [Resourceful routes naming convention](https://documentation.platformos.com/developer-guide/modules/platformos-modules#resourceful-route-naming-convention). You can modify the redirect path with a param called `redirect_to` or you can set `redirect_to` in `hook_user_login` hook. Example code that redirects a user to `/admin` endpoint if they have `admin_pages.view` permission:

```
assign redirect_to = '/'
function can = 'modules/user/helpers/can_do', requester: params.user, do: 'admin_pages.view'
if can
  assign redirect_to = '/admin'
endif

assign res = '{}' | parse_json | hash_merge: redirect_to: redirect_to
return res
```

### Reset password

### RBAC Authorization


### Built-in helpers commands/queries

#### Query which returns the amount of all users in the system

```
function users_count = 'modules/user/queries/user/count'
```

#### Query which returns currently authenticated user

```
function current_user = 'modules/user/queries/user/current'
```

#### Query which returns permissions of a given user

```
function permissions = 'modules/user/queries/user/get_permissions', user: user
```


## Customizing the module

You can easily customize the module using [overwriting a module file](https://documentation.platformos.com/developer-guide/modules/modules#overwritting-a-module-file). In this section you will find some most common examples.

### Example 1: Changing sign up URL

By default the module creates [Page](https://documentation.platformos.com/developer-guide/pages/pages) which defines `/users/new` endpoint to display the registration form. If you would like to change it, for example to `/sign-up`, you can do it by creating a file overwrite for this page and manually defining `slug: sign-up`. 

First, create nested directories to be able to place your file overwrite there:

`mkdir -p app/modules/user/public/views/pages/users/`

Copy the page you would like to overwrite:

`cp modules/user/public/views/pages/users/new.liquid app/modules/user/public/views/pages/users/new.liquid`

Edit the overwrite `app/modules/user/public/views/pages/users/new.liquid` YAML section of the Page (make sure you are modifying the overwrite and not the original file - overwrites are inside `<project root>/app/modules` directory, whereas original files will be in `<project root>/modules`):

```yaml
---
slug: sign-up
---
```
```liquid
{% raw %}
{% liquid
  function current_user = 'modules/user/queries/user/current'
  include 'modules/user/helpers/can_do_or_unauthorized', requester: current_user, do: 'users.register'

  function registration_fields = 'modules/user/queries/registration_fields/load'
  theme_render_rc 'modules/user/users/new', context: context, registration_fields: registration_fields
%}
{% endraw %}
```

As the end result, the registration form will be located now in /sign-up, and /users/new will render 404 Not Found error.

### Example 2: Modifying the HTML of the sign in form

First, create the directory for the overwrite. Because we want to override the presentation layer, we should overwrite the [Partial](https://documentation.platformos.com/developer-guide/pages/reusing-code-across-multiple-pages). 

`mkdir -p modules/user/public/views/partials/sessions`

Please note that in this example we are  working with `sessions` directory, because this is where Sign In functionality is located. Copy the partial which is responsible for rendering the sign in form:

`cp modules/user/public/views/partials/sessions/new.liquid app/modules/user/public/views/partials/sessions/new.liquid`

You can now freely modify the presentation layer of your session. Only overwrite the page if you need to provide extra data to the partial.

## Versioning

```
git fetch origin --tags
npm version major | minor | patch
```
