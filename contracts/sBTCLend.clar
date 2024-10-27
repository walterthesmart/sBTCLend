;; Enhanced Lending and Borrowing Protocol

;; Constants for error handling
(define-constant ERR-NO-INTEREST (err u100))
(define-constant ERR-OVERPAY (err u200))
(define-constant ERR-OVERBORROW (err u300))
(define-constant ERR-INSUFFICIENT-COLLATERAL (err u400))
(define-constant ERR-LIQUIDATION-THRESHOLD (err u500))
(define-constant ERR-UNAUTHORIZED (err u600))
(define-constant ERR-PAUSED (err u700))
(define-constant ERR-INVALID-AMOUNT (err u800))

;; Protocol configuration
(define-data-var contract-owner principal tx-sender)
(define-data-var emergency-pause bool false)
(define-data-var minimum-collateral-ratio uint u150) ;; 150% collateralization required
(define-data-var liquidation-threshold uint u130) ;; Liquidation occurs below 130% collateralization
(define-data-var liquidation-penalty uint u10) ;; 10% penalty on liquidation
(define-data-var base-interest-rate uint u5) ;; 5% base interest rate
(define-data-var utilization-multiplier uint u15) ;; Interest rate scales with utilization

;; Storage
(define-map deposits 
    { owner: principal }
    { 
        amount: uint,
        last-interest-claim: uint,
        cumulative-interest: uint
    }
)

(define-map loans 
    principal 
    {
        amount: uint,
        collateral: uint,
        last-interest-update: uint,
        interest-accrued: uint
    }
)

(define-map liquidator-whitelist principal bool)

;; Protocol state variables
(define-data-var total-deposits uint u0)
(define-data-var total-borrows uint u0)
(define-data-var pool-reserve uint u0)
(define-data-var last-price uint u0) ;; Price feed for collateral calculations

;; Access control
(define-private (is-contract-owner)
    (is-eq tx-sender (var-get contract-owner))
)

(define-private (is-liquidator)
    (default-to false (map-get? liquidator-whitelist tx-sender))
)

;; Pause/unpause contract (emergency control)
(define-public (set-pause (pause bool))
    (begin
        (asserts! (is-contract-owner) ERR-UNAUTHORIZED)
        (var-set emergency-pause pause)
        (ok true)
    )
)

;; Update price feed
(define-public (update-price (new-price uint))
    (begin
        (asserts! (is-contract-owner) ERR-UNAUTHORIZED)
        (var-set last-price new-price)
        (ok true)
    )
)

;; Calculate dynamic interest rate based on utilization
(define-private (calculate-interest-rate)
    (let (
        (utilization-rate (if (is-eq (var-get total-deposits) u0)
            u0
            (/ (* (var-get total-borrows) u100) (var-get total-deposits))
        ))
    )
    (+ (var-get base-interest-rate)
       (* utilization-rate (var-get utilization-multiplier)))
))

;; Calculate accrued interest for a loan
(define-private (calculate-accrued-interest (principal uint) (blocks uint))
    (let (
        (rate (calculate-interest-rate))
        (interest-per-block (/ (* principal rate) (* u100 u144))) ;; Daily compounding (144 blocks per day)
    )
    (* interest-per-block blocks)
))

;; Check collateralization ratio
(define-private (is-sufficiently-collateralized (user principal))
    (let (
        (loan (unwrap! (map-get? loans user) false))
        (collateral-value (* (get collateral loan) (var-get last-price)))
        (loan-value (+ (get amount loan) (get interest-accrued loan)))
        (current-ratio (/ (* collateral-value u100) loan-value))
    )
    (>= current-ratio (var-get minimum-collateral-ratio))
))

;; Enhanced deposit function with interest tracking
(define-public (deposit (amount uint))
    (let (
        (current-deposit (default-to {amount: u0, last-interest-claim: u0, cumulative-interest: u0}
            (map-get? deposits {owner: tx-sender})))
    )
        (asserts! (not (var-get emergency-pause)) ERR-PAUSED)
        (asserts! (> amount u0) ERR-INVALID-AMOUNT)
        
        (try! (contract-call? .sBTC transfer amount tx-sender (as-contract tx-sender) none))
        
        (map-set deposits 
            {owner: tx-sender}
            {
                amount: (+ (get amount current-deposit) amount),
                last-interest-claim: block-height,
                cumulative-interest: (get cumulative-interest current-deposit)
            }
        )
        (var-set total-deposits (+ (var-get total-deposits) amount))
        (ok true)
    )
)

;; Enhanced borrow function with collateral requirements
(define-public (borrow (amount uint) (collateral uint))
    (let (
        (current-loan (default-to 
            {amount: u0, collateral: u0, last-interest-update: block-height, interest-accrued: u0}
            (map-get? loans tx-sender)))
    )
        (asserts! (not (var-get emergency-pause)) ERR-PAUSED)
        (asserts! (> amount u0) ERR-INVALID-AMOUNT)
        (asserts! (>= (* collateral (var-get last-price)) 
            (* amount (var-get minimum-collateral-ratio))) ERR-INSUFFICIENT-COLLATERAL)
        
        ;; Transfer collateral
        (try! (contract-call? .sBTC transfer collateral tx-sender (as-contract tx-sender) none))
        
        (map-set loans tx-sender
            {
                amount: (+ (get amount current-loan) amount),
                collateral: (+ (get collateral current-loan) collateral),
                last-interest-update: block-height,
                interest-accrued: (get interest-accrued current-loan)
            }
        )
        
        ;; Transfer borrowed amount
        (try! (contract-call? .sBTC transfer amount (as-contract tx-sender) tx-sender none))
        
        (var-set total-borrows (+ (var-get total-borrows) amount))
        (ok true)
    )
)

;; Liquidation function
(define-public (liquidate (borrower principal))
    (let (
        (loan (unwrap! (map-get? loans borrower) ERR-INVALID-AMOUNT))
        (collateral-value (* (get collateral loan) (var-get last-price)))
        (loan-value (+ (get amount loan) (get interest-accrued loan)))
        (current-ratio (/ (* collateral-value u100) loan-value))
    )
        (asserts! (is-liquidator) ERR-UNAUTHORIZED)
        (asserts! (<= current-ratio (var-get liquidation-threshold)) ERR-LIQUIDATION-THRESHOLD)
        
        ;; Calculate liquidation amount including penalty
        (let (
            (liquidation-amount (+ loan-value 
                (/ (* loan-value (var-get liquidation-penalty)) u100)))
        )
            ;; Transfer collateral to liquidator
            (try! (contract-call? .sBTC transfer 
                (get collateral loan) 
                (as-contract tx-sender) 
                tx-sender 
                none))
            
            ;; Clear the loan
            (map-delete loans borrower)
            (var-set total-borrows (- (var-get total-borrows) (get amount loan)))
            
            (ok true)
        )
    )
)

;; Repay loan
(define-public (repay (amount uint))
    (let (
        (loan (unwrap! (map-get? loans tx-sender) ERR-INVALID-AMOUNT))
        (total-owed (+ (get amount loan) (get interest-accrued loan)))
    )
        (asserts! (not (var-get emergency-pause)) ERR-PAUSED)
        (asserts! (<= amount total-owed) ERR-OVERPAY)
        
        ;; Transfer repayment
        (try! (contract-call? .sBTC transfer amount tx-sender (as-contract tx-sender) none))
        
        ;; Update loan state
        (if (is-eq amount total-owed)
            ;; Full repayment - return collateral
            (begin
                (try! (contract-call? .sBTC transfer 
                    (get collateral loan) 
                    (as-contract tx-sender) 
                    tx-sender 
                    none))
                (map-delete loans tx-sender)
            )
            ;; Partial repayment
            (map-set loans tx-sender
                {
                    amount: (- (get amount loan) amount),
                    collateral: (get collateral loan),
                    last-interest-update: block-height,
                    interest-accrued: (- (get interest-accrued loan) 
                        (/ (* amount (get interest-accrued loan)) total-owed))
                }
            )
        )
        
        (var-set total-borrows (- (var-get total-borrows) amount))
        (ok true)
    )
)

;; Read-only functions for querying contract state
(define-read-only (get-loan-info (user principal))
    (map-get? loans user)
)

(define-read-only (get-deposit-info (user principal))
    (map-get? deposits {owner: user})
)

(define-read-only (get-current-interest-rate)
    (calculate-interest-rate)
)

(define-read-only (get-collateralization-ratio (user principal))
    (let (
        (loan (unwrap! (map-get? loans user) u0))
        (collateral-value (* (get collateral loan) (var-get last-price)))
        (loan-value (+ (get amount loan) (get interest-accrued loan)))
    )
    (/ (* collateral-value u100) loan-value)
    )
)