# Kryptonite
Kryptonite is a protocol within the Sei ecosystem that encompasses Staking, StableCoin, and Lending functionalities. Our objective is to generate secure and stable yields by holding interest-bearing assets such as Sei, Atom, ETH, etc. Additionally, we offer the capability to provide interest-free liquidity against collateralized bAsset assets. Moreover, users can lend out the free-minted kUSD to other borrowers who possess valid collateral assets. Kryptonite leverages Sei's fastest Layer1 infrastructure to provide users with an optimal experience.
## System Architecture Diagram
![image](https://github.com/KryptoniteDAO/Kryptonite/blob/master/res/kpt_architecture_diagram.jpg)

## krp-staking-contracts
This module supports SEI bonding as bSEI or stSEI. SEI is used for voting for super nodes within the Seinetwork, generating around 10% APR. The Staking module periodically triggers reward distribution of SEI obtained from the network to users holding bSEI or stSEI. The distinction between bSEI and stSEI lies in the form of rewards. Users holding bSEI receive rewards in the form of stablecoin kUSD, while stSEI holders receive SEI rewards that are compounded by reinvesting in super nodes.


## krp-market-contracts
The money-market protocol facilitates lending and borrowing. Users holding kUSD stablecoins contribute to the supply side of the market. Assets whitelisted in the market are eligible for borrowing. Users can borrow kUSD by over-collateralizing mainstream assets, gaining stablecoin liquidity, and benefiting from platform token incentives.


## krp-basset-convert
This tool serves as a wrapper for cross-chain IBC (denom form) assets such as ETH, BTC, etc. It converts them into CW20 format assets. In the market's lending protocol, only CW20 format assets are eligible for collateral.


## krp-cdp-contracts
This module manages the stablecoin kUSD. Users can mint kUSD by over-collateralizing LSD assets bSEI. Additionally, users can redeem 1 kUSD to retrieve assets worth 1 USD in bSEI at any time. The bAsset assets minted in kUSD will deduct 1.8% of Apr's Staking income as agreement income, and these agreement income will be distributed to users holding veSEILOR.


## krp-oracle
It encapsulates interactions with the Pyth oracle. By providing pricing data to the market and CDP modules, it facilitates lending, minting, liquidation, and other operational logics based on collateral values.


## krp-token-contracts 
These contracts define the implementation of the Kryptonite platform's token SEILOR. They manage token vesting, distribution, liquidity mining, veSEILOR mining rewards, and other related functionalities.

### Seilor Address on BSC:
0xE29142E14E52bdFBb8108076f66f49661F10EC10

### Seilor Address on Sei Network:
sei123gd6c6je3nmtjuvesuwhxphtuxgtuu6gu5ck3h5zcn6qqzzmgaqe85df2


## swap-extension
This module abstracts interactions with swaps. Currently, it supports trading pairs from SparrowSwap. In the reward distribution of the Staking module, users holding bSEI will receive kUSD rewards. This module's encapsulated interfaces enable SEI to kUSD conversions within the staking module.
