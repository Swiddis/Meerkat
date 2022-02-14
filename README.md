# How to create a Svelte app

An example full-stack serverless Svelte app created with SST.

## Getting Started

[**Read the tutorial**](https://serverless-stack.com/examples/how-to-create-a-svelte-app-with-serverless.html)

Install the example.

```bash
$ npm init serverless-stack --example svelte-app
# Or with Yarn
$ yarn create serverless-stack --example svelte-app
```

## Commands

### `npx sst start`

Starts the local Lambda development environment.

### `npx sst build`

Build your app and synthesize your stacks.

Generates a `.build/` directory with the compiled files and a `.build/cdk.out/` directory with the synthesized CloudFormation stacks.

### `npx sst deploy --stage prod`

Deploy all your stacks to AWS. Or optionally deploy, a specific stack.

### `npx sst remove`

Remove all your stacks and all of their resources from AWS. Or optionally removes, a specific stack.

### `npx sst test`

Runs your tests using Jest. Takes all the [Jest CLI options](https://jestjs.io/docs/en/cli).

## Documentation

Learn more about the Serverless Stack.

- [Docs](https://docs.serverless-stack.com)
- [@serverless-stack/cli](https://docs.serverless-stack.com/packages/cli)
- [@serverless-stack/resources](https://docs.serverless-stack.com/packages/resources)

## Community

[Follow us on Twitter](https://twitter.com/ServerlessStack) or [post on our forums](https://discourse.serverless-stack.com).
