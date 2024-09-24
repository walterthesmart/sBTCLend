# Lending Platform Smart Contract

## Overview

This repository contains a Clarity smart contract for a decentralized lending platform on the Stacks blockchain. The contract allows users to deposit and withdraw sBTC, borrow against their deposits, and automatically applies interest to loans.

## Features

1. **Deposit**: Users can deposit sBTC into the platform.
2. **Withdraw**: Users can withdraw their deposited sBTC.
3. **Borrow**: Users can borrow sBTC against their deposits.
4. **Interest Calculation**: Automatic interest calculation on loans.
5. **Pool Reserve**: A pool reserve is maintained to collect interest payments.

## Contract Structure

The contract uses several data structures and variables:

- `deposits`: A map that tracks each user's deposits.
- `loans`: A map that tracks each user's loans and their last interaction.
- `total-deposits`: A variable that keeps track of the total sBTC deposited.
- `pool-reserve`: A variable that tracks the total interest collected.
- `loan-interest-rate`: The interest rate applied to loans (currently set at 10%).

## Functions

### `deposit`

Allows users to deposit sBTC into the platform.

```clarity
(define-public (deposit (amount uint)))
```

### `withdraw`

Enables users to withdraw their deposited sBTC.

```clarity
(define-public (withdraw (amount uint)))
```

### `borrow`

Allows users to borrow sBTC against their deposits.

```clarity
(define-public (borrow (amount uint)))
```

## Error Handling

The contract includes several error constants to handle different scenarios:

- `err-no-interest`: Used when there's an issue calculating interest.
- `err-overpay`: Triggered when a user attempts to withdraw more than they've deposited.
- `err-overborrow`: Occurs when a user tries to borrow more than their deposit allows.

## Security Considerations

- The contract uses the `as-contract` function to ensure that token transfers are executed with the contract's authority.
- Assertions are used to prevent overborrowing and overwithdrawing.

## Future Improvements

1. Implement a repayment function for loans.
2. Add a liquidation mechanism for undercollateralized loans.
3. Implement variable interest rates based on utilization.
4. Add events for important actions (deposits, withdrawals, borrows).

## Testing

(Note: Add information about your testing strategy and how to run tests once implemented.)

## Deployment

(Note: Add information about how to deploy this contract to testnet and mainnet once you've set up the deployment process.)

## Contributing

We welcome contributions to improve this lending platform. Please submit pull requests with detailed descriptions of your changes.

## License

MIT