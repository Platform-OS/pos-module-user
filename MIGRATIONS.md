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

2. Run the following liquid script to migrate roles from user table to the new profile table:
```
{% liquid
graphql total = 'modules/user/user/count'
assign count = total.users.total_entries
assign pages = count | divided_by: 20.0 | ceil

for page in (1..pages)
  graphql r = 'modules/user/user/search', page: page, limit: 20
  for user in r.users.results
    assign roles = user.roles
    assign id = user.id
    graphql profile_result= 'modules/user/profiles/search', user_id: id, limit: 1, page: 1
    assign profile = profile_result.records.results.first

    if profile != null
      assign object = '{}' | parse_json | hash_merge: valid: true, id: profile.id, roles: roles
      function object = 'modules/core/commands/execute', object: object, mutation_name: 'modules/user/profiles/roles/set'
    endif
  endfor
endfor
%}
```

3. Remove the profile module and delete the modules/profiles/profiles table.

4.  Remove roles from user configuration in the [app/user.yml](https://documentation.platformos.com/developer-guide/users/user#adding-properties-to-the-user) file if present.

5. Update application code to use current profile ```modules/user/helpers/current_profile``` instead of user for checking permissions.
