# Migrations

### Updating from <5.0.0 to 5.0.0
In order to update the module from previous versions to version 5.0.0, install the newest user module and then perform the following steps:
1. Run the profile migration graphql query:
```
mutation {
  records_update_all(sync: false, table: "modules/profile/profile", record: { table: "modules/user/profile" }) {
    count
  }
}
```
Validate if all records from the modules/profile/profiles table have been properly migrated to modules/user/profiles.

2. Remove the profile module and delete the modules/profiles/profiles table.

3.  Remove user configuration in the [app/user.yml](https://documentation.platformos.com/developer-guide/users/user#adding-properties-to-the-user) file if present.

4. Update application code to use current profile instead of user for checking permissions.
```yaml
properties:
  - name: roles
    type: array
