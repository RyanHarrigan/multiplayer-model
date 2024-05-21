# Multiplayer Model
This is a sandbox demo that demonstrates a collaborative environment with [Threejs](https://threejs.org/), [PartyKit](https://www.partykit.io/) and [Astro](https://astro.build/). It is not fully-featured and is not meant to be a model of best-practices. Just a PoC that was built in a few hours.

## Getting started
1) run `yarn` to install dependencies [installation](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)
2) run `yarn party` to start websocket server
3) run `yarn dev` to run local frontends and visit `http://localhost:4321` in as many browser windows as you like

## Running a deployed server
1) Follow [PartyKit's deployment instructions](https://docs.partykit.io/guides/deploying-your-partykit-server/) to deploy your server
2) copy the `.env.sample` to `.env` and copy/paste the URL you received from step 1. Should be something like http://[package.json-name].[github-id].partykit.dev
3) run `yarn build` to make the frontend dist and deploy it
4) NOTE: You need to deploy to http since the url in 2 is also http. Note that browsers may need to 'forget' HSTS on your deployed URL  

### Caveats
no auth
