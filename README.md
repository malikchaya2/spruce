# [Spruce](https://spruce.mongodb.com) &middot; [![GitHub license](https://img.shields.io/badge/license-Apache2.0-blue.svg)](https://github.com/evergreen-ci/spruce/master/LICENSE)

Spruce is the React UI for MongoDB's continuous integration software.

## Table of Contents

- [Getting Started](#getting-started)
  - [Running Locally](#running-locally)
  - [Environment Variables](#environment-variables)
- [Deployment](#deployment)
  - [Requirements](#requirements)
  - [How to Deploy](#how-to-deploy)

## Getting Started

### Running Locally

1. Clone the Spruce Github repository
2. Ask a colleague for their .cmdrc.json file and follow the instructions [here](#environment-variables)
3. Run `npm install`
4. Start a local evergreen server by doing the following:

- Clone the evergreen repo into your go path
- Run `make local-evergreen`

5. Run `npm run dev`. This will launch the app and point it at the local evergreen server you just ran.

### Storybook

Run `npm run storybook` to launch storybook and view our shared components.

### Code Formatting

Install the Prettier code formatting plugin in your code editor if you don't have it already. The plugin will use the .prettierrc settings file found at the root of Spruce to format your code.

### GQL Query Linting

Follow these directions to enable query linting during local development so your Evergreen GraphQL schema changes are reflected in your Spruce query linting results.

1. Symlink the standard definition language GraphQL schema used in your backend to a file named sdlschema in the root of the Spruce directory to enable query linting with ESlint like so `ln -s /path/to/schema sdlschema.graphql`
2. Run `npm run eslint` to see the results of query linting in your terminal or install a plugin to integrate ESlint into your editor. If you are using VSCode, we recommend ESLint by Dirk Baeumer.

### Environment Variables

[env-cmd](https://github.com/toddbluhm/env-cmd#readme) is used to configure build environments for production, staging and development. This file is git ignored because it contains API keys that we do not want to publish. It should be named `.cmdrc.json` and placed in the config folder at the root of the project. This file is required to deploy Spruce to production and to staging. Ask a team member to send you their copy of the file, which should look like the following:

```js
{
  "devServer": {
    "REACT_APP_GQL_URL": "http://localhost:9090/graphql/query",
    "REACT_APP_API_URL": "http://localhost:3000/api",
    "REACT_APP_UI_URL": "http://localhost:9090",
    "REACT_APP_SPRUCE_URL": "http://localhost:3000"
  },
  "mockIntrospectSchema": {
    "REACT_APP_GQL_URL": "http://localhost:9090/graphql/query",
    "REACT_APP_ENABLE_GQL_MOCK_SERVER": "true"
  },
  "mockCustomSchema": {
    "REACT_APP_SCHEMA_STRING": "type Patch {\n id: ID!\n description: String!\n project: String!\n githash: String!\n patchNumber: Int!\n author: String!\n version: String!\n status: String!\n createTime: Time!\n startTime: Time!\n finishTime: Time!\n variants: [String]!\n tasks: [String]!\n variantTasks: [VariantTask]!\n activated: Boolean!\n alias: String!\n }\n type Query {\n userPatches(userId: String!): [Patch]!\n }\n type StatusDetails {\n status: String!\n type: String!\n desc: String!\n }\n scalar Time\n type VariantTask {\n display_name: String!\n tasks: [String]!\n }\n"
  },
  "staging": {
    "REACT_APP_API_URL": "https://evergreen-staging.corp.mongodb.com/api",
    "REACT_APP_UI_URL": "https://evergreen-staging.corp.mongodb.com"
  },
  "prod": {
    "REACT_APP_DEPLOYS_EMAIL": "something@something.com", 
    "REACT_APP_SITE_URL": "https://spruce.mongodb.com",
    "REACT_APP_BUGSNAG_API_KEY": "this-is-the-api-key",
    "REACT_APP_API_URL": "https://evergreen.mongodb.com/api",
    "REACT_APP_UI_URL": "https://evergreen.mongodb.com",
    "REACT_APP_NEW_RELIC_ACCOUNT_ID": "dummy-new-relic-account-id",
    "REACT_APP_NEW_RELIC_AGENT_ID": "dummy-new-relic-agent-id",
    "REACT_APP_NEW_RELIC_APPLICATION_ID": "dummy-new-relic-application-id",
    "REACT_APP_NEW_RELIC_LICENSE_KEY": "dummy-new-relic-license-key",
    "REACT_APP_NEW_RELIC_TRUST_KEY": "dummy-new-relic-trust-key"
  }
}
```

## GraphQL Type Generation

We use Code generation to generate our types for our GraphQL queries and mutations. When you create a query or mutation you can run the code generation script with the steps below. The types for your query/mutation response and variables will be generated and saved to `gql/generated/types.ts`. Much of the underlying types for subfields in your queries will likely be generated there as well and you can refer to those before creating your own.

### Setting up code generation

- create a symlink from the `schema.graphql` file from evergreen with the spruce folder using `ln -s path-to-evergreen-schema.graphql sdlschema.graphql`

### Using code generation

- From within the spruce folder run `npm run codegen`
- As long as your queries are declared correctly the types should generate

### Code generation troubleshooting and tips

- Queries should be declared with a query name so the code generation knows what to name the corresponding type.
- Each query and mutation should have a unique name.
- Since query analysis for type generation occurs statically we cant place dynamic variables with in query strings we instead have to hard code the variable in the query or pass it in as query variable.

## Deployment

### Requirements

You must be on the `master` Branch if deploying to prod.

A `.cmdrc.json` file is required to deploy because it sets the environment variables that the application needs in production and staging environments. See [Environment Variables](#environment-variables) section for more info about this file.

### How to Deploy:

Run the `deploy:prod` or `deploy:staging` npm command

1. `npm run deploy:prod` = deploy to https://spruce.mongodb.com
2. `npm run deploy:staging` = deploy to http://evergreen-staging.spruce.s3-website-us-east-1.amazonaws.com/

After deploying you will be prompted to run `git push --tags` this is important so we can track releases. 
