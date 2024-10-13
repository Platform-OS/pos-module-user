# User Module

This module serves as a starting point for adding authentication and RBAC (Role-Based Access Control) to your application. Before using the module for the first time, we recommend reviewing the official platformOS documentation on [User Authentication Basics](https://documentation.staging.oregon.platform-os.com/get-started/build-your-first-app/user-authentication) and [Example Application](#example-application)

This module follows the [platformOS DevKit best practices](https://documentation.staging.oregon.platform-os.com/developer-guide/modules/platformos-modules) and includes the [core module](https://github.com/Platform-OS/pos-module-core) as a dependency, enabling you to implement patterns such as [Commands](https://github.com/Platform-OS/pos-module-core?tab=readme-ov-file#commands--business-logic) and [Events](https://github.com/Platform-OS/pos-module-core?tab=readme-ov-file#events).

For more information, 
- read the documentation about the [built-in User table](https://documentation.platformos.com/developer-guide/users/user),
- learn about [how platformOS manages sessions](https://documentation.platformos.com/developer-guide/users/session),
- and gain a high-level overview of [authentication strategies in platformOS](https://documentation.platformos.com/developer-guide/users/authentication).

## Installation

The platformOS User Module is available on the [Partner Portal Modules Marketplace](https://partners.platformos.com/marketplace/pos_modules/139).

### Prerequisites

Before installing the module, ensure that you have [pos-cli](https://github.com/mdyd-dev/pos-cli#overview) installed. This tool is essential for managing and deploying platformOS projects.

The platformOS User Module is fully compatible with [platformOS Check](https://github.com/Platform-OS/platformos-lsp#platformos-check----a-linter-for-platformos), a linter and language server that supports any IDE with Language Server Protocol (LSP) integration. For Visual Studio Code users, you can enhance your development experience by installing the [VSCode platformOS Check Extension](https://marketplace.visualstudio.com/items?itemName=platformOS.platformos-check-vscode).

### Installation Steps

1. **Navigate to your project directory** where you want to install the User Module.

2. **Run the installation command**:

```bash
   pos-cli modules install user
```

This command installs the User Module along with its dependencies ([pos-module-core](https://github.com/Platform-OS/pos-module-core)) and updates or creates the `app/pos-modules.json` file in your project directory to track module configurations.

### Setup

1. First, install the module using the [pos-cli](https://github.com/Platform-OS/pos-cli).

2. Configure the [components](https://github.com/Platform-OS/pos-module-components) theme paths by adding the following `theme_search_paths` property to the [app/config.yml](https://documentation.platformos.com/developer-guide/platformos-workflow/directory-structure/config) file:

```yaml
theme_search_paths:
  - ''
  - modules/user
```

3. Configure  [app/user.yml](https://documentation.platformos.com/developer-guide/users/user#adding-properties-to-the-user) file:

```yaml
properties:
  - name: roles
    type: array

```

4. (optional) create [migration](https://documentation.platformos.com/developer-guide/platformos-workflow/directory-structure#migrations) which would setup `USER_DEFAULT_ROLE` [constant](https://documentation.platformos.com/api-reference/liquid/platformos-objects#context-constants)

To generate a new migration, you can use `pos-cli migrations generate` command (remember to change `env` to your environment that you've used for `pos-cli env add` command. If you don't remember it, check `.pos` file.)

```
  pos-cli migrations generate <env> setup_user_default_role
```

Add the following line of code to the newly created migration file to set the default role to `member`:

```
{% liquid
  function result = 'modules/core/commands/variable/set', name: 'USER_DEFAULT_ROLE', value: 'member'
  log result, type: 'setup_user_default_role result'
%}
```

Do not forget to deploy your code, to invoke the newly created migration:

```
pos-cli deploy <env>
```

5. (optional) Overwrite default views by following [overwriting a module file guide](https://documentation.platformos.com/developer-guide/modules/modules#overwritting-a-module-file) - this allows you to add functionality based on your project requirements, like extend the reigstration form with additional fields etc.

6. (optional) To manually set user's role, use `pos-cli gui serve` GraphQL explorer to invoke the following query (you can check user's id via `pos-cli gui serve` -> [Users](http://localhost:3333/users))

```
mutation () {
  user: user_update(id: 1, user: { properties: [{ name: "roles", value_array: ["superadmin"] }] }) {
    id
    email
    roles: property_array(name: roles)
  }
}
```

### Managing Module Files

The default behavior of modules is that **the files are never deleted**. It is assumed that developers might not have access to all of the files, and thanks to this feature, they can still overwrite some of the module's files without breaking them. Since the User Module is fully public, it is recommended to delete files on deployment. To do this, ensure your `app/config.yml` includes the User Module and its dependencies in the list `modules_that_allow_delete_on_deploy`:

``` yaml
modules_that_allow_delete_on_deploy:
- core
- user
```

### Troubleshooting

> There is an error about missing partial `Liquid error: can't find partial "components/molecules/pagetitle". url: my-application.staging.oregon.platform-os.com/users/new page: users/new`

This error occurs because the [app/config.yml](/developer-guide/platformos-workflow/directory-structure/config) has not been configured as instructed. You need to add the `theme_search_paths` in the `app/config.yml` file:

```yml
theme_search_paths:
  - modules/user
```

## Example application

We recommend creating a [new Instance](https://partners.platformos.com/instances/new) and deploying this module as an application to get a better understanding of the basics and the functionality this module provides. When you install the module using `pos-cli modules install user`, only the contents of the `modules/user` will be available in your project. The purpose of the `app` directory is to work as an example of how you could incorporate the user module in your application. when analyzing the code in the `app` directory, you should pay attention to:

* The `app/config.yml` and `app/user.yml`, which are defined per the [Setup](#setup) instructions
* The `app/views/page/index.liquid` - it implements the example application homepage, which displays information about the currently logged in user if available, or provides links for registration, sign in and reset password functionality for not authenticated user
* The `app/views/pages/admin/index.liquid` - it implements the `/admin` page, which demonstrates permission checking functionality
* The `app/modules/user/public/lib/queries/role_permissions/permissions.liquid` - it demonstrates how you should configure permissions in your application by [overwriting a module file](https://documentation.platformos.com/developer-guide/modules/modules#overwriting-a-module-file)

## Functionality provided by the user module:

When the module is installed and you have completed the [setup](#setup) in your application, you will immediately get access to the new endpoints created by this module. For example, you can navigate to `/users/new` for the registration form or `/sessions/new` for a log in form. This chapter describes all of the functionalities provided by this module, and includes a roadmap for a potential new functionalities in the future.

- [x] **[Registration](#crud-endpoints-including-registration)**:  
Provides CRUD operations (Create, Read, Update, Delete) for user management and implements the necessary endpoints for user registration. These views are located in the `modules/user/public/views/pages/users/` directory. This handles essential user registration processes in platformOS.
- [x] **[Session-Based Authentication](#session-based-authentication)**:  
This feature enables **Sign In** and **Sign Out** forms, providing session-based authentication. It includes endpoints and forms for securely managing user sessions on the platform.
- [x] **[Reset Password](#reset-password)**:  
 Enables users to reset their password through defined endpoints in the `modules/user/public/views/pages/passwords/` directory. Note that on the staging environment, [email notifications require additional configuration to send email](https://documentation.platformos.com/get-started/build-your-first-app/sending-email-notifications#enabling-emails-on-the-staging-instance).
- [x] **[RBAC Authorization](#rbac-authorization)**:
Implements Role-Based Access Control (RBAC), allowing fine-grained authorization management based on user roles. This lets you define who can access specific parts of your platform based on assigned roles.

TODO (Upcoming Features)

- [ ] **2FA Authentication**:  
   Adds **Two-Factor Authentication (2FA)**, including:
   - **Displaying OTP secret QR code** for setting up 2FA. More details can be found in the [OTP secret object documentation](https://documentation.platformos.com/api-reference/graphql/common/objects/otp).
   - **OTP Verification**: After setting up 2FA, the user will need to verify the code. Refer to the [OTP verification documentation](https://documentation.platformos.com/api-reference/graphql/common/objects/authenticate).
- [ ] **Mandatory Email Verification (Feature Flag)**:  
Adds a feature flag to enforce **mandatory email verification**, ensuring users validate their email addresses before gaining full access to the platform.
- [ ] **Mandatory SMS Verification (Feature Flag)**:  
Similar to email verification, this feature flag will enforce **mandatory SMS verification** during the registration process to improve account security.
- [ ] **OAuth Module Integration**:  
Implementing and integrating a module for **OAuth** will allow users to authenticate using external identity providers (such as Google, Facebook, or GitHub).
- [ ] **[JWT Authentication](https://documentation.platformos.com/api-reference/graphql/common/objects/authenticate)**:  
Enables **JWT (JSON Web Token) authentication**, allowing for secure, stateless authentication through token-based authentication mechanisms.
- [ ] **Built-in CAPTCHA Protection**:  
Adding **CAPTCHA** to various user authentication forms to prevent spam and automated sign-ups, improving platform security.

### Registration

The **User module** is fully functional and requires no modifications to implement a basic registration process. This module provides essential **CRUD operations** for the built-in **[User object](https://documentation.platformos.com/developer-guide/users/user)** in platformOS, enabling you to manage users.

With these CRUD commands, you can handle typical user management operations such as registering new users, updating user information, and managing user data through platformOS’s API.

#### Endpoints for the registration

The table below contains a table with [Resourceful routes](https://documentation.platformos.com/developer-guide/modules/platformos-modules#resourceful-route-naming-convention) provided by for the registration functionality:

| HTTP method   | slug  | page file path |  description |
|---|---|---|---|
| GET  | /users/new | `modules/user/public/views/pages/users/new.liquid` | Renders a registration form with inputs for email and password. |
| POST  | /users | `modules/user/public/views/pages/users/create.liquid` | Adds a new [User](https://documentation.platformos.com/developer-guide/users/user) to the database or re-renders the form if validation errors occur. You can modify the redirect path using the `redirect_to` param or by setting it in the `hook_user_create`. |

#### CRUD commands 

The User module provides basic CRUD (Create, Read, Update, Delete) functionality for managing users in platformOS. You can run commands such as creating or deleting users.

The User module provides basic CRUD (Create, Read, Update, Delete) functionality for managing users in platformOS. You can run commands such as creating or deleting users.

You can create:

```
function result = 'modules/user/commands/user/create', email: 'admin@example.com', password: 'password', roles: []
```

load:

```
function user = 'modules/user/queries/user/load', id: '1'
```

> [!NOTE] 
> Usually you will want to load the currently authenticated user, you can achieve it by providing [context.current_user.id](https://documentation.platformos.com/api-reference/liquid/platformos-objects#context-current_user) as ID

update:

```
function user = 'modules/user/queries/user/update', id: '1', email: 'admin@example.com', password: 'password'
```

and delete:

```
function result = 'modules/user/commands/user/delete', id: '1'
```

#### Assigning roles to users during registration

The `POST /users` endpoint defined in `modules/user/public/views/pages/users/create.liquid` will assign the default role equal to the constant `DEFAULT_USER_ROLE` - see [setup](#setup).

### Session-Based Authentication

#### Endpoints for Sign In / Sign Out

The following table provides [Resourceful routes](https://documentation.platformos.com/developer-guide/modules/platformos-modules#resourceful-route-naming-convention) provided by for the sign in / sign out functionality:

| HTTP method   | slug  | page file path |  description |
|---|---|---|---|
| GET  | /sessions/new | `modules/user/public/views/pages/sessions/new.liquid` | Renders a sign-in form with inputs for user's email and password. |
| POST  | /sessions | `modules/user/public/views/pages/sessions/create.liquid` | Creates a session for the authenticated user based on [password authentication](https://documentation.platformos.com/developer-guide/users/authentication#password) or re-renders the sign in form if credentials do not match. You can modify the redirect path with a param called `redirect_to` or you can set `redirect_to` in `hook_user_login` hook. |
| DELETE  | /sessions |  `modules/user/public/views/pages/sessions/delete.liquid` | Invalidates the current session and logging the user out. |

Example: You can define a `hook_user_login` that redirects a user to `/admin` if they have the `admin_pages.view` permission. 

```
assign redirect_to = '/'
function can = 'modules/user/helpers/can_do', requester: params.user, do: 'admin_pages.view'
if can
  assign redirect_to = '/admin'
endif

assign res = '{}' | parse_json | hash_merge: redirect_to: redirect_to
return res
```

#### Log in using email and password

You can log the user in (which [creates a new session](https://documentation.platformos.com/developer-guide/users/session#security)) using the following command:

```
function res = 'modules/user/commands/session/create', email: 'email@example.com', password: 'password'
```

This command also triggers the `hook_user_login` hooks.

#### Accessing current user

To access information about the currently logged in user, we recommend you to use the following command provided by the module:

```
function user = 'modules/user/queries/user/current'
```

It is implemented in `modules/user/public/lib/queries/user/current.liquid` and if you investigate the file, you will notice that on top of loading user's information from the database, it also extends user's roles with either [authenticated](#authenticated-role) or [anonymous](#anonymous-role) if the user is not currently logged in.

#### Log out

To log out a user and destroy their session, run the following command:

```
function res = 'modules/user/commands/session/destroy'
```

This command triggers the `hook_user_logout` hooks.

#### Log in without password validation 

It’s possible to skip password validation and create a session while triggering the `hook_user_login` by setting the `validate_password` boolean argument to `false` when calling the `modules/user/commands/session/create` command. In this case, the `user_id` argument must be provided.

```
function res = 'modules/user/commands/session/create', user_id: '1', validate_password: false
```

### Reset password

The reset password functionality consists of two resources: `password` and `authentication_link`. 

#### Endpoints for Reset Password

The table below contains [Resourceful routes](https://documentation.platformos.com/developer-guide/modules/platformos-modules#resourceful-route-naming-convention) provided for the reset password functionality, ordered based on the flow. The flow begins at `GET /passwords/reset` and ends at `POST /passwords/create`, which updates the password and redirects the user to the sign-in page.

| HTTP method   | slug  | page file path |  description |
|---|---|---|---|
| GET  | /passwords/reset | `modules/user/public/views/pages/passwords/reset.liquid` | Renders a reset password form. |
| POST  | /authentication_links | `modules/user/public/views/pages/authentication_links/create.liquid` | Generates a link with [temporary token](https://documentation.platformos.com/developer-guide/users/authentication#temporary-token) and sends an email using the `modules/user/commands/emails/auth-link` command to the email address provided by the user in the reset password step.  |

| GET  | /passwords/edit | `modules/user/public/views/pages/passwords/edit.liquid` | User lands here by clicking on the reset password link in the email. This endpoint [authenticates the user using the temporary token](https://documentation.platformos.com/developer-guide/users/authentication#temporary-token) and, if successful, redirects them to `GET /passwords/new`. |
| GET  | /passwords/new | `modules/user/public/views/pages/passwords/new.liquid` | Renders a form where the user can provide their new password. |
| POST  | /passwords/create | `modules/user/public/views/pages/passwords/create.liquid` | Overwrites the existing user's password with the new password and redirects the user to the `GET /sessions/new` endpoint, so they can log in. |

#### CRUD commands 

To create or update a given user's password:

```
function result = 'modules/user/commands/passwords/create', object: object
```

To create an `authentication link` that points to the `GET /passwords/edit` endpoint, which will be sent to the user's email, use the following command. The authentication link will include [a temporary token that authenticates a user based on their email only](https://documentation.platformos.com/developer-guide/users/authentication#temporary-token):

```
function object = 'modules/user/commands/authentication_links/create', email: "john@doe.com", host: context.location.host
```

### RBAC Authorization

The module provides the foundation for implementing **Role-Based Access Control (RBAC)** in your platformOS application. As described in the registration section, all users initially receive the role defined by DEFAULT_USER_ROLE [constant](https://documentation.platformos.com/api-reference/liquid/platformos-objects#context-constants).

#### Built-in roles

There are three built-in roles that are provided out of the box by the module

##### anonymous role

This role is artificially granted in `modules/user/public/lib/queries/user/current.liquid`. It represents an anonymous user, for which you might want to still want to check some permission. For example, only anonymous users should be able to sign in or register into the system. This is why you will see built-in permissions in `modules/user/public/lib/queries/role_permissions/permissions.liquid` for `users.register` and `sessions.create`, which are checked in [Endpoints for Sign-In](#endpoints-for-sign-in-sign-out) and [Endpoints for the registration](#endpoints-for-the-registration).

A typical example that involves anonymous user is for the eCommerce website to allow anonymous users to purchase anything without registration.

##### authenticated role

This role is artificially granted in `modules/user/public/lib/queries/user/current.liquid`. It represents an authenticated user. The typical use case to leverage this role is to restrict certain areas from anonymous users, however not assign a proper role to the user just yet. For example, authenticated users might get access to a free content, however to be able to access paid content, they would need to create subscription, upon which the system will give them additional role like `member` or `subscriber` with additional permissions.

##### superadmin

Any user with `superadmin` role will get immediate access to any permission checked the [Authorization Commands](#authorization-commands)

#### Role management commands

The roles are stored in [User's property](https://documentation.platformos.com/developer-guide/users/user#adding-properties-to-the-user) named `roles`. 

You can append role using the `append` command:

```
function result = 'modules/user/commands/user/roles/append', id: 1, role: "admin"
```

You can remove role using the `remove` command:

```
function result = 'modules/user/commands/user/roles/remove', id: 1, role: "admin"
```

You can set multiple roles at once using the set command:

```
assign roles = ['member', 'admin'] | parse_json
function result = 'modules/user/commands/user/roles/set', id: 1, roles: roles
```

#### Authorization Commands 

The module offers several helper commands to authorize users:

##### `can_do` command

This command returns `true` or `false` depending on whether the user has permission to perform the operation defined by the `do` argument. It is useful for modifying the UI based on permissions, ensuring that functionalities a user does not have access to are not displayed.

```
# platformos-check-disable CodeUnrachable
function can = 'modules/user/helpers/can_do', requester: user, do: 'admin_pages.view'
# platformos-check-enable CodeUnrachable
```

It can also accept additional `entity` and `access_callback` arguments, which allow you to [write your own authorization rules](#creating your-own-authorization-commands) in a clean way.

##### `can_do_or_unauthorized` command

If the user does not have permission, the system renders a **403 Unauthorized** page, and the flow stops. This command uses the deprecated `include` tag to work with the `break` Liquid tag properly - we do not want to execute code past this point if the user has no permission.

```
# platformos-check-disable ConvertIncludeToRender
include 'modules/user/helpers/can_do_or_unauthorized', requester: current_user, do: 'users.register'
# platformos-check-enable ConvertIncludeToRender
```

The `platformos-check-disable` and `platformos-check-enable` tags are used to prevent the [platformOS-check](https://github.com/Platform-OS/platformos-check) from reporting a warning for using the `include` tag instead of the recommended `render` tag.

##### `can_do_or_redirect` command

If the user does not have permission, they will be redirected to the URL provided as an argument. This command uses the deprecated `include` tag to work with the `break` Liquid tag properly - we do not want to execute code past this point if the user has no permission.


```
# platformos-check-disable ConvertIncludeToRender
include 'modules/user/helpers/can_do_or_redirect', requester: current_user, do: 'users.register', return_url: '/sessions/new'
# platformos-check-enable ConvertIncludeToRender
```

The `platformos-check-disable` and `platformos-check-enable` will let [platformos-check](https://github.com/Platform-OS/platformos-check) to not report a warning for using the `include` tag instead of the `render` tag.

###### creating your own authorization commands

You can leverage the existing commands but still provide your custom authorization rules by leveraging the `access_callback` and `entity` arguments. Consider a real life complex example:

```
{% assign order = '{"buyer_id": 1, "seller_id": 2}' | parse_json %}
function can = 'modules/user/helpers/can_do', requester: user, do: 'orders.confirm', entity: order, access_callback: 'can/orders'
```

In this example `access_callback` is set to `can/orders` - we recommend to put all of your authorization rules in one place - `app/lib/can`and name it after the [Resource](https://documentation.platformos.com/developer-guide/modules/platformos-modules#resourceful-route-naming-convention)

The `entity` is representing the object to which you would like to check if the requester has access. In this example, it's an eCommerce order. 

The example implementation of the `app/lib/can/orders.liquid` might be as follows:

```
{% liquid
  assign order = entity

  if order == blank
    return false
  endif

  # for simplicity, there is a special orders.manage.all permission, which allows the requester to do anything with the orders.
  # Because it leverages can_do helper, it will be always true for the superadmin.
  function can_manage_all = 'modules/user/helpers/can_do', requester: requester, do: 'orders.manage.all'

  if can_manage_all
    return true
  endif

  # Check if the requester has a role that grants permission equal to `do`
  function can = 'modules/user/helpers/can_do', requester: requester, do: do

  if can
    case do
    when 'orders.confirm'
      if requester.id == order.seller_id
        return true
      endif
    when 'orders.buyer_cancel'
      if requester.id == order.buyer_id
        return true
      endif
    endcase
  endif

  return can
%}
```

The rules can be explained as follows:
* if the requester has access to the `orders.manage.all` permission, do not check granular permission anymore (like order.confirm in this example) - just grant access to anything related to orders.
* otherwise, check if the requester has permission to do `do` - `orders.confirm` in this example
* if they do, then check if the requester should have access to this particular order - just because they have `orders.confirm` permission, does not mean they should be able to confirm all orders - sellers should be able to confirm only their own orders. In this example, we store `seller_id` which should correspond to the `requester.id`, but in more complex scenario, you might need to do additional graphql queries and enrich `requester` or `order` with additional data to be able to perform authorization.

#### Defining Roles' Permissions

Roles and their permissions are defined in the `modules/user/public/lib/queries/role_permissions/permissions.liquid` file in a simple JSON format. You can modify this file to suit your application’s requirements. For example, if you want to add a new role, such as **foo**, with permissions **foo.show** and **foo.manage**, you can extend the JSON as follows:

```
  "foo": [
    "foo.show",
    "site.manage"
  ]
```

If you receive a **500 error** after modifying the `permissions.liquid` file, check the logs for hints. The error might be due to an invalid JSON format, such as a missing or extra comma. For example, the following modification will raise an error due to a trailing comma:


```
  "foo": [
    "foo.show",
    "site.manage", <- this comma will cause an error
  ]
```

##### Conventions when adding permissions to your application

* Name your permissions as `<resource>.<do>` - for example `article.create`, `article.edit`, `comment.delete`
* Use `<resource>.manage.all` for administrators/moderators - typically regular users should have permission only to the entities they create - for example if your application is a blog and it allows users to write comments, then the users should be able to edit and delete their comments. Administrators / Moderators on the other hand need permission to edit and delete all comments. We recommend creating `<resource>.manage.all` permission for this purpose and handling it as described in the [creating your own authorization commands](#creating-your-own-authorization commands) example.

## Customizing the Module

You can easily customize the **User module** by [overwriting a module file](https://documentation.platformos.com/developer-guide/modules/modules#overwriting-a-module-file). This allows you to modify specific functionalities without changing the original code. Below are some common customization examples.

### Example 1: Changing the Sign-Up URL

By default, the module creates a [Page](https://documentation.platformos.com/developer-guide/pages/pages) with the `/users/new` endpoint for the registration form. If you'd like to change it (e.g., to `/sign-up`), you can do so by overwriting this page and updating the `slug`.

Steps:
1. Create the necessary nested directories to be able to place your overwrite file there:

`mkdir -p app/modules/user/public/views/pages/users/`

2. Copy the original page file you would like to overwrite:

`cp modules/user/public/views/pages/users/new.liquid app/modules/user/public/views/pages/users/new.liquid`

3. Edit the overwrite file located in `app/modules/user/public/views/pages/users/new.liquid`. Modify the YAML section of the page to change the `slug`. (Make sure you are modifying the overwrite and not the original file—overwrites are located in the `<project root>/app/modules` directory, whereas the original files are located in the `<project root>/modules` directory.)

4. Modify the Liquid code - explicitly define `slug` property to `sign-up` of the `app/modules/user/public/views/pages/users/new.liquid` [Page](https://documentation.platformos.com/developer-guide/pages/pages) to define `/sign-up` endpoint:

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

As a result, the registration form will now be available at `/sign-up`, and the `/users/new` URL will render a 404 Not Found error.

### Example 2: Modifying the HTML of the Sign-In Form
If you want to modify the **Sign-In** form's HTML, you can overwrite the [Partial](https://documentation.platformos.com/developer-guide/pages/reusing-code-across-multiple-pages) responsible for rendering the form.
If you want to modify the **Sign-In** form's HTML, you can overwrite the [Partial](https://documentation.platformos.com/developer-guide/pages/reusing-code-across-multiple-pages) responsible for rendering the form.

Steps:
1. Create the directory for the overwrite. Since we are overriding the presentation layer, we should overwrite the [Partial](https://documentation.platformos.com/developer-guide/pages/reusing-code-across-multiple-pages).

`mkdir -p modules/user/public/views/partials/sessions`

2. Copy the partial responsible for rendering the sign-in form:

`cp modules/user/public/views/partials/sessions/new.liquid app/modules/user/public/views/partials/sessions/new.liquid`
> [!NOTE] 
> Please note that in this example, we are working with the `sessions` directory, as this is where the Sign-In functionality is located.
Now, you can freely modify the HTML or presentation layer of the sign-in form in the copied file.
> [!NOTE] 
> Please note that in this example, we are working with the `sessions` directory, as this is where the Sign-In functionality is located.
## Helper Queries and Commands

The module also provides several useful queries and commands to help you manage users and permissions

### Query: Count All Users

```
function users_count = 'modules/user/queries/user/count'
```

### Query: Get Currently Authenticated User

```
function current_user = 'modules/user/queries/user/current'
```

### Query: Get Information About User Based on ID

```
function current_user = 'modules/user/queries/user/load', id: 1
```

## Versioning

To manage versioning with Git and npm, you can follow these commands:

```
git fetch origin --tags
npm version major | minor | patch
```
