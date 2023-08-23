# Kryptonite
Kryptonite is a protocol within the Sei ecosystem that encompasses Staking, StableCoin, and Lending functionalities. Our objective is to generate secure and stable yields by holding interest-bearing assets such as Sei, Atom, ETH, etc. Additionally, we offer the capability to provide interest-free liquidity against collateralized bAsset assets. Moreover, users can lend out the free-minted kUSD to other borrowers who possess valid collateral assets. Kryptonite leverages Sei's fastest Layer1 infrastructure to provide users with an optimal experience.
## System Architecture Diagram
![image](https://github.com/KryptoniteDAO/Kryptonite/blob/master/res/kpt_architecture_diagram.jpg)

## krp-staking-contracts
This module supports SEI bonding as bSEI or stSEI. SEI is used for voting for super nodes within the Sei network, generating around 10% APR. The Staking module periodically triggers reward distribution of SEI obtained from the network to users holding bSEI or stSEI. The distinction between bSEI and stSEI lies in the form of rewards. Users holding bSEI receive rewards in the form of stablecoin kUSD, while stSEI holders receive SEI rewards that are compounded by reinvesting in super nodes.


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

### Seilor bridge BSC to Sei Network:
0xa8Ea7FF6443f6D08a690Fa51Ebe76319af1bA23d


## swap-extension
This module abstracts interactions with swaps. Currently, it supports trading pairs from astroport. In the reward distribution of the Staking module, users holding bSEI will receive kUSD rewards. This module's encapsulated interfaces enable SEI to kUSD conversions within the staking module.

# What is veSEILOR and SEILOR?
veSEILOR is VotingEscrow SEILOR. It holds an equivalent value to SEILOR and is tied to the total supply of SEILOR. While veSEILOR cannot be traded or directly transferred, it possesses voting rights and is entitled to a share of protocol earnings. The primary source of veSEILOR is mining rewards. veSEILOR holders have the option to convert their veSEILOR to SEILOR through a vesting process. During this process, veSEILOR is gradually converted into SEILOR over a 30-day period.
Users can acquire veSEILOR by participating in liquidity provision for trading pairs like kUSD/USDC, bSEI/SEI, kUSD/SEI, and SEILOR/SEI. Additionally, engaging in lending and borrowing activities on the market and minting kUSD can also lead to veSEILOR rewards.

# Token Utilities
## Hold veSEILOR to Govern
veSEILOR is used to receive voting power and govern the protocol. Control the direction of the Kryptonite community, treasury, and protocol, and change protocol parameters.
## Hold veSEILOR to Boost Yields
100% of LSD Distribution Service Fee will be distributed to veSEILOR holders.
## Treasury holdings and Protocol revenue
Allocation of treasury holdings, distribution of Protocol revenue, and investing in ecosystem projects.

# How to obtain bSEI?
Users on the Kryptonite platform can convert SEI to bSEI using the bond feature. Locked SEI tokens will be used to vote for SEI Network super nodes, and users will receive approximately 10% APR yield from the commitments of the super nodes. The theoretical exchange rate between bSEI and SEI is 1:1. The exchange rate for the underlying native asset will only decrease when on-chain nodes experience a Slash. The protocol also incorporates a mechanism where a certain proportion of fees (currently set at 0.3%) will be deducted from the unbonding process during instances of quantity punishment, to fill the intermediate gap until the 1:1 peg is restored, after which no fees will be charged. User staking rewards on the chain will be periodically reclaimed (tentatively every 4 hours) and distributed evenly among bAsset (bSEI) holders based on their share in the bAsset. During this process, 5% will be sent to the protocol treasury as protocol fees. Users can initiate unbonding and redemption operations at any time, and according to the current Sei chain mechanism, the entire process takes about 21 days.
```math
  bSEIExchangeRate = \frac{SEIBonded}{bSEISupply}
```
# What is kUSD?
The Kryptonite protocol introduces negative-interest loans. Users can collateralize their LSD assets, primarily SEI or bSEI, within the protocol to generate stablecoin kUSD at no cost. This ensures a collateralization ratio of over 200%, safeguarding it from liquidation. Users can choose to repay kUSD to the Kryptonite protocol at any time, thereby reducing the supply of kUSD. They are then able to retrieve their collateral. Additionally, the protocol does not impose a specific timeframe for users to return kUSD to the system. In theory, users can hold kUSD indefinitely, as long as their collateralization ratio remains above the liquidation threshold.
```math
  R_{collateral} = \frac{Deposited_{SEI} * Price_{SEI}}{Borrowed_{kUSD}}
```

# What is the use of kUSD?
By collateralizing bSEI, users can acquire kUSD at no cost. This essentially means that the protocol generates liquidity for users without charge. Users can utilize kUSD to purchase other cryptocurrencies or in scenarios requiring cash flow, all while retaining their position in LSD assets, provided they maintain a collateralization ratio above 200%. The second option for users is to deposit kUSD into the "EARN" module, effectively lending it to other qualified borrowers with eligible collateral and earning interest on the loan based on a formulaic interest rate (refer to the Market section for details).

# Does staking yield continue for bSEI collateral used to mint kUSD?
Staking rewards for bSEI used to mint kUSD will persist. The protocol will deduct 1.8% of the staking rewards as protocol income. This means that even after minting kUSD, users can still expect to receive around 7.2% APR in staking rewards.

# What is the Market?
Market is a decentralized lending marketplace where users holding kUSD can deposit their kUSD and users with eligible collateral can borrow against it, paying interest to the depositors based on an interest rate calculation formula. In the early stages, eligible collateral assets supported by Market include ETH, BTC, and ATOM, which can be used as collateral to borrow kUSD.  
  Utilization Rate Formula:
```math
Ratio_{utilization} = \frac{Lent_{kUSD}}{Deposit_{kUSD}}
```
The stablecoin borrow rate increases proportionally with the utilization ratio. Parameter values of the equation are initially configured to accrue a 30% annualized borrow rate when the utilization ratio is at 66.7%, with a minimum base borrow rate of 2%.  
  Borrow Rate Formula:
```math
Rate_{borrow} = Ration_{utilization} * Multipier_{interest} + Rate_{base}
```
The borrow rate equation incentivizes markets to have sufficient liquidity at their equilibrium. An increase in borrow demand is met with higher borrow rates, incentivizing repayments, and restoring market liquidity.

