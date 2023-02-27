# User Module

This module handles the user operations, assign users to roles and add permissions to roles.

If you want to use user related form components, you can use [User module](https://github.com/Platform-OS/pos-module-user-forms).

## Usage

### User operations

You can create:

```
function result = 'modules/user/lib/commands/user/create', email: 'admin@example.com', password: 'password'
```

load:

```
function user = 'modules/user/lib/queries/user/load', id: '1'
```

search:

```
function user = 'modules/user/lib/queries/user/search', limit: 10, sort_order: 'DESC'
```

update:

```
function user = 'modules/user/lib/queries/user/update', id: '1', email: 'admin@example.com', password: 'password'
```

and delete:

```
function result = 'modules/user/lib/commands/user/delete', id: '1'
```

These functions will fire `hook_user_create/load/update/delete` hooks.

There is also a default rest handlers to register (`POST /users/register`) a session. You can modify the redirect path with a param called `redirect_to` or you can set `redirect_to` in `hook_user_create`

```
assign redirect_to = '/'
function can = 'modules/permission/lib/helpers/can_do', requester: params.user, do: 'admin_pages.view'
if can
  assign redirect_to = '/admin'
endif

assign res = '{}' | parse_json | hash_merge: redirect_to: redirect_to
return res
```

### Authentication

You can create:

```
function res = 'modules/user/lib/commands/session/create', email: 'email@example.com', password: 'password'
```

or destroy a user session:

```
function res = 'modules/user/lib/commands/session/destroy'
```

These functions will fire `hook_user_login/logout` hooks.

It's possible to skip password validation and just create a session and fire `hook_user_login` by set `validate_password` boolean to `false` when calling `sessions/create` command. In this case to have to set `user_id`.

```
function res = 'modules/user/lib/commands/session/create', user_id: '1', validate_password: false
```

There are also default rest handlers to create (`POST /user/sessions/create`) or destroy (`GET /sessions/destroy`) a session. You can modify the redirect path with a param called `redirect_to` or you can set `redirect_to` in `hook_user_login`

```
assign redirect_to = '/'
function can = 'modules/permission/lib/helpers/can_do', requester: params.user, do: 'admin_pages.view'
if can
  assign redirect_to = '/admin'
endif

assign res = '{}' | parse_json | hash_merge: redirect_to: redirect_to
return res
```

### Helpers

```
function users_count = 'modules/user/lib/queries/user/count'
```

```
function current_user = 'modules/user/lib/queries/user/current'
```

```
function permissions = 'modules/user/lib/queries/user/get_permissions', user: user
```

## Hooks

### Implements

- hook_module_info
- hook_admin_page
- hook_permission

### Own hooks

#### hook_user_create

Fires when the user is created. The created user is added to `params.created_user` and the other sent params are added to `params.hook_params`.

For example:

```
{% parse_json args %}
  {
    "user_id": {{ params.created_user.id | json }},
    "first_name": {{ params.hook_params.first_name | json }},
    "last_name": {{ params.hook_params.last_name | json }},
    "dog_name": {{ params.hook_params.dog_name | json }},
    "favorite_color": {{ params.hook_params.favorite_color | json }}
  }
{% endparse_json %}
{% liquid
  function profile = 'lib/commands/profiles/create', args: args
  return profile
%}
```

#### hook_user_load

Fires when the user is loaded. The loaded user is added to `params.user`. You can return with your user related data.

```
function profile = 'lib/quieries/profiles/load', user_id: params.user.id
assign result = '{}' | parse_json | hash_merge: profile: profile
return result
```

#### hook_user_load_alter

Fires after the user is loaded. You can override the already loaded user object before returning it in `modules/user/lib/queries/user/load`.

```
function profile = 'lib/queries/profiles/find', user_id: params.user.id
hash_assign params_to_modify['user']['roles'] = profile.roles

return params_to_modify
```

#### hook_user_search_query_alter

Fires before the user search query will be run. You can override the query params, add filter joins and result data to the query.

```
{%- capture profile_filter -%}
  {
    join: { join_on_property: "id", foreign_property: "user_id" }
    filter: {
      table: { value: "modules/community/profile" }
      or: [
        { properties: { name: "first_name", contains: $query }}
        { properties: { name: "last_name", contains: $query }}
      ]
    }
  }
{%- endcapture -%}

{%- capture profile_result %}
  related_record(
    table: "modules/community/profile"
    join_on_property: "id"
    foreign_property: "user_id"
  ) {
    id
    created_at
    type: table

    name: property(name: "name")
    first_name: property(name: "first_name")
    last_name: property(name: "last_name")

    avatar: related_record(
      table: "photo"
      join_on_property: "uuid"
      foreign_property: "object_uuid"
      filter: { properties: { name: "photo_type", value: "avatar" } }
    ) {
      photo_width: property_int(name: "photo_width")
      photo_height: property_int(name: "photo_height")
      photo: property_upload(name: "photo") {
        url
        versions
      }
    }
  }
{% endcapture %}

{%liquid
  hash_assign params_to_modify['filter_joins']['profile'] = profile_filter
  hash_assign params_to_modify['result_joins']['profile'] = profile_result
  hash_assign params_to_modify['query_params']['query'] = 'String'

  return params_to_modify
%}
```

#### hook_user_update

Fires when the user is updated. The updated user is added to `params.updated_user`. You can return with your updated user related data.

```
function profile = 'lib/quieries/profiles/update', user_id: params.updated_user.id, first_name: params.hook_params.first_name
assign result = '{}' | parse_json | hash_merge: profile: profile
return result
```

#### hook_user_delete

Fires when the user is deleted. The deleted user is added to `params.user`.

```
function _delete_ = 'lib/commands/profiles/delete', user_id: params.user.id
return nil
```

#### hook_user_login

Fires when the user is logged in. The logged in user is added to `params.user`.

```
function count = 'lib/commands/profiles/increment_logins_number', user_id: params.user.id
assign result = '{}' | parse_json | hash_merge: login_count: count
return result
```

#### hook_user_logout

Fires when the user is logged out. The logged out user is added to `params.user`.

```
function count = 'lib/commands/profiles/increment_logouts_number', user_id: params.user.id
assign result = '{}' | parse_json | hash_merge: logout_count: count
return result
```

## Versioning

```
git fetch origin --tags
npm version major | minor | patch
```
