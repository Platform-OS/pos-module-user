# User Module

This module handles the user operations, assign users to roles and add permissions to roles.

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
and delete:
```
function result = 'modules/user/lib/commands/user/delete', id: '1'
```
This functions will fire `hook_user_create/load/delete` hooks.

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
- hook_admin_menu
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

#### hook_user_delete
Fires when the user is deleted. The deleted user is added to `params.user`.

```
function _delete_ = 'lib/commands/profiles/delete', user_id: params.user.id
return nil
```
