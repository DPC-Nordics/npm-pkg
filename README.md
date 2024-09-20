# Publish an NPM package

Thought it is simple to publish a rudimentary NPM package, there are a lot of pitfalls. The following guide only covers the basics. For more advanced and thorough guide, check out guide by [Matt Pocock at TotalTypescript](https://www.totaltypescript.com/how-to-create-an-npm-package). It contains steps for tooling like linting with ESlint, formatting with Prettier, testing with Vitest and more.

As a DDP member, you can also clone/fork this repository to get started. You can also use this repository as a `template` to make sure you get clean setup without any backlinks to this repo.

## Setup

> Follow guide at end to setup Git for your package

### Setup Local environment

- Install NodeJS from https://nodejs.org/. This will also install the NPM CLI. _Note: Install the LTS version of Node._
- Install `git`, if not already installed. _Note: It is not required if the code is not published to a Git service like GitHub._
- Install a code editor. A good option is VSCode, but any editor with TypeScript/JavaScript support is fine.

### Setup NPM account

- Create an account on [NPM](https://www.npmjs.com/). The NPM username is important as it will be part of your package name.
- Create an Access Token which will be used to publish packages (both locally and via CI).
  - Visit /settings/{Your-Username}/tokens (accessible from your profile in top-right corner).
  - Click "Generate New Token" and select "Classic Token".
  - Give a name to token which will help you remember the use case.
  - Select "Automation" type since it will skip 2FA in CI.
  - Click "Generate Token".
  - Copy the generated token in a safe place as it will not be shown again.

### Setup package project

- Create a new directory/folder in your local machine. The name could match the intended package name.
- Open the new directory/folder in either Terminal or VSCode.
- Create following files which are needed for building/publishing the package.

- `package.json`

  - Responsible for configuring NPM package
  - The file can be created manually or by running `npm init` command in your directory.
  - The content should match following structure

  ```json
  {
    "name": "@<username>/<package-name>",
    "version": "0.0.0",
    "type": "module",
    "description": "Description of your project",
    "author": "Your name",
    "repository": "github-url",
    "license": "MIT",
    "sideEffects": false,
    "publishConfig": {
      "access": "public"
    },
    "main": "./dist/index.js",
    "module": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
      "./package.json": "./package.json",
      ".": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    },
    "scripts": {
      "build": "tsc",
      "dev": "tsc -w",
      "start": "node dist/index.js"
    },
    "devDependencies": {
      "typescript": "^5.0.0"
    }
  }
  ```

- `tsconfig.json`

  - Responsible for configuring typescript
  - The file can be created manually or by running `npx tsc --init` command in your directory.
  - The content should match following structure

  ```json
  {
    "include": ["src"],
    "exclude": ["node_modules", "dist"],
    "compilerOptions": {
      "target": "ES2020",
      "module": "NodeNext",
      "outDir": "dist",
      "rootDir": "src",
      "jsx": "react-jsx",
      "sourceMap": true,
      "declaration": true,
      "strict": true,
      "noImplicitAny": true,
      "isolatedModules": true,
      "verbatimModuleSyntax": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "resolveJsonModule": true,
      "moduleDetection": "force"
    }
  }
  ```

- `.npmrc`

  - Responsible for authenticating against NPM
  - This file should be ignored/excluded from Git tracking
  - The content should match following:

  ```sh
  //registry.npmjs.org/:_authToken="<YOUR_NPM_TOKEN>"
  ```

- `src/index.ts`

  - The code in this file will be transpiled and published to NPM.

## Build and publish

- Run `npm install` in directory to install dependencies
- Run `npm run build` to build the package
- Run `npm publish` to publish package. (make sure `.npmrc` file exist before publishing.)

## Setup Git and Github CI

- Add file `.gitignore` to package with following content:

  ```sh
  node_modules
  dist
  .env*
  !.env.sample
  .npmrc
  .DS_Store
  ```

- Add file `publish.yaml` in folder `.github/workflows` in your package folder with following content:

```yaml
name: Publish
on:
  push:
    branches:
      - "main"
env:
  NPM_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
jobs:
  publish:
    permissions:
      contents: read
      id-token: write
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - name: Setup NPM TOKEN
        run: echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc
      - name: Install dependencies
        run: npm ci
      - name: Build package
        run: npm build
      - name: Publish to NPM
        run: npm publish
```

- Create an account on [GitHub](https://github.com).
- Create a new repository on GitHub.

  - The name can match the intended package name. The repo can be private if needed.
  - There is no need to add any file or select any other option.
  - Create the repo.
  - There will be steps that will taken later to link the package to this repo.

- Add NPM AuthToken to Github secrets

  - Goto your Github Repo settings
  - Open from sidebar: "Secrets and variables"->"Actions"
  - Click "New repository secret" button
  - For name, type "NPM_AUTH_TOKEN"
  - For value, paste the NPM token that was generated before and used in `.npmrc`
  - Click "Add Secret" button.

- Run other commands as instructed by GitHub to link the package with Github, like
  - `git init`
  - `git add --all`
  - `git commit -m "init commit"`
  - `git remote add origin ....` # replace .... with your git url.
  - `git branch -M main`
  - `git push -u origin main`
