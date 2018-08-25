# mark-two

...bringing assignments, exams and marks to the Blockchain. :rocket:

This is a **DApp for Ethereum** allowing you to create so-called assignments, mainly consisting of a question and the possibility to solve such assignments. Moreover external correctors can grade these solutions. Creators of assignments can also incentivise their tasks.  
After a corrector has graded all solutions (s)he can receive a reward in the form of **M2C-Tokens** (Mark2Coin-Tokens)! :moneybag:

## How to set it up
1. Set providers for web3.
 The current configuration requires to add http addresses to a `secrets/providers.json` file.
 It's supposed to look like this:
 ```
 {
	"local": "ADDRESS TO LOCAL CHAIN",
	"ropsten": "ADDRESS TO ROPSTEN CHAIN",
	"mainnet": "ADDRESS TO MAINNET CHAIN"
 }
 ```

 There's a good chance that you don't want to run a node locally to connect to. Instead you can request a free API key on [Infura](https://infura.io/) for example.
 Then you can utilize the connection in `src/server.js`. The current set up has preconfigured a connection to ropsten:
 `var eth = new ether.Eth(providers.ropsten);`  
2. Install dependencies: `npm install`  
3. Add the [Metamask](https://metamask.io/) extension to your browser. The application was developed using Firefox and Chrome so there's no guarantee that it will work on Mist or Brave. Actually there are no guarantees given that this application works at all.  
4. You'll need ether, the currency of the Ethereum network on order to use this application, regardless if you want to create tasks or merely want to solve them.  
For the ropsten network you can request free ether from a [faucet](https://faucet.ropsten.be/). In case you want use this application on the 'official' Ethereum blockchain (mainnet) you'll need to acquire ether for real money.  
5. Point to a token.  
 The application is designed to utilize the M2C-token which's source code is included within this repo. However, theoretically you can point to any contract address which belongs to ERC20 compliant token.  
 Within `src/js/app.js` change the following line:  
 `app.m2cAddress = 'INSERT ADDRESS FOR TOKEN HERE';`  
 You can also use this app **without any tokens**. In this case, the reward feature is not available although the UI will suggest otherwise.  
6. Spin up a local database (yes, this app utilizes a SQL db, SQLite3 actually): `./makeSQLite.sh`  
7. Start the development server:
`npm start`

The development server exposing the API is running now!

## Use the DApp

You will find the app under `http://localhost:3000`. The UI is pretty self-explanatory so i won't go into details here.

## Tests

Run `truffle test` to run tests. Note that the test coverage is pretty low so the tests cannot ensure that all parts of the applicatopn do work properly.

---

This DApp was part of my **Bachelor's thesis**. Hence this app was **never meant to run in production**. This is also the reason why this DApp will probably never show up at [State of DApps](https://www.stateofthedapps.com/). Feel free to reach out to me in case of any questions :)
