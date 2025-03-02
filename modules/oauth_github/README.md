
# OAuth2 Github Module

This module serves as an example of creating a custom OAuth2 module.

## Configuration
`{name}` can be set to any string identifying an OAuth2 integration.

This module requires the following constants to work:

| Constant | Value |
| - | - |
| OAUTH2_{name}_PROVIDER | This value must match one OAuth2 module. For example, for GitHub OAuth2 module this value should be set to `github`. |
| OAUTH2_{name}_NAME | Display name that will be visible to all users. |
| OAUTH2_{name}_CLIENT_ID | Client ID of the OAuth 2 application. |
| OAUTH2_{name}_SECRET_VALUE| Client ID of the OAuth 2 application. |


## Custom OAUTH2 provider

To implement a custom OAUTH2 provider, you must provide two commands:

`get_redirect_url` - which generates a redirect URL to begin the OAUTH2 flow.

`get_user_info` - which returns a dictionary:

| Key | Value |
| - | - |
| sub | User's id in the external system |
| first_name | User's first name. |
| last_name | User's last name. |
| email | User's email. |
| valid | A boolean indicating whether the flow was successful or not. |