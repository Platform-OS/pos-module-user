# Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

## v4.1.1
* Fix: Hide OAuth 2 section when no providers are available

## v4.1.0
* Feature: OAuth 2

## v4.0.0
* Replaced components with common styling

## v3.1.1

* Fix: Session variables on log-out.

## v3.1.0

* Feature: add impersonation feature

## v3.0.10

* Fix: redirect user to `session.return_to` after sign up, automatically log user in by default

## v3.0.9

Added `redirect_anonymous_to_login` and `anonymous_return_to` parameters to `can_do_or_unauthorized` command

## v3.0.7

Chore: bump core module

## v3.0.6

Add `modules/user/queries/roles/custom` and `modules/user/queries/roles/all` queries to get roles based on `permissions` file

## v3.0.3

* Fix modules/user/roles/append, modules/user/roles/remove and modules/user/roles/set commands
* Added `tests` module as a dependency and provide some unit tests that reproduced the issue


## v3.0.1

* Merge `user` and `permissions` modules into one
* Move `roles` array from a dedicated table to `user.yml` for performance and reducing complexity
* Move permissions to a single Liquid file for performance and simplicity

## [v1.0.2](https://github.com/Platform-OS/pos-module-user/compare/v1.0.1...v1.0.2)

> 10 November 2022

### Breaking changes

### Merged pull requests
- Update changelog template [`#13`](https://github.com/Platform-OS/pos-module-user/pull/13)

### Fixes

## [v1.0.1](https://github.com/Platform-OS/pos-module-user/compare/v1.0.0...v1.0.1)

> 2 November 2022

### Breaking changes

### Merged pull requests
- Fix typo [`#6`](https://github.com/Platform-OS/pos-module-user/pull/6)

### Fixes

## v1.0.0

> 2 November 2022

### Breaking changes

### Merged pull requests
- Versioning [`#8`](https://github.com/Platform-OS/pos-module-user/pull/8)
- Use build/check when validating the authentication [`#11`](https://github.com/Platform-OS/pos-module-user/pull/11)
- Permission handling for registration [`#10`](https://github.com/Platform-OS/pos-module-user/pull/10)
- admin hooks [`#9`](https://github.com/Platform-OS/pos-module-user/pull/9)
- Register and session handlers [`#7`](https://github.com/Platform-OS/pos-module-user/pull/7)
- Authentication and authorization [`#4`](https://github.com/Platform-OS/pos-module-user/pull/4)
- Add roles and permission support [`#3`](https://github.com/Platform-OS/pos-module-user/pull/3)
- User list [`#2`](https://github.com/Platform-OS/pos-module-user/pull/2)
- Basics (create, load, delete) [`#1`](https://github.com/Platform-OS/pos-module-user/pull/1)

### Fixes
