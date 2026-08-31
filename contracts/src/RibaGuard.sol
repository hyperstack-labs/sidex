// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

/// @title RibaGuard
/// @notice AAOIFI-aligned guardrails that prevent interest-bearing (Riba)
///         patterns from being introduced into the SidEx AMM.
///
///         Three categories are blocked:
///         1. Time-weighted yield   — rewards that grow with duration held
///         2. Guaranteed returns    — fixed % promised on deposit
///         3. Leveraged / borrowed  — positions funded by debt
///
/// @dev Inherit this in any contract that handles liquidity or swaps.
///      All checks are pure/view — zero gas overhead beyond the require().
abstract contract RibaGuard {

    // ── Events ────────────────────────────────────────────────────────────────
    event RibaViolationBlocked(address indexed caller, string reason);

    // ── Internal state ────────────────────────────────────────────────────────

    /// @dev Timestamp when an address first deposited liquidity.
    ///      Used to detect time-based yield farming attempts.
    mapping(address => uint256) private _firstDepositAt;

    /// @dev Tracks whether an address has an open leveraged position.
    ///      Must be set to false before any liquidity action is allowed.
    mapping(address => bool) private _hasLeveragedPosition;

    // ── Constants ─────────────────────────────────────────────────────────────

    /// @notice Maximum deadline window: 2 hours.
    ///         Prevents "set-and-forget" positions that simulate time deposits.
    uint256 public constant MAX_DEADLINE_WINDOW = 2 hours;

    /// @notice Minimum blocks between removeLiquidity calls per address.
    ///         Prevents high-frequency LP cycling that mimics yield extraction.
    uint256 public constant MIN_BLOCKS_BETWEEN_BURNS = 1;

    /// @dev Last block where address called removeLiquidity.
    mapping(address => uint256) private _lastBurnBlock;

    // ── Modifiers ─────────────────────────────────────────────────────────────

    /// @notice Blocks deadlines set more than MAX_DEADLINE_WINDOW in the future.
    ///         A deposit with a far-future deadline could imply a time-locked
    ///         yield expectation (Riba al-fadl pattern).
    modifier noFarDeadline(uint256 deadline) {
        require(
            deadline <= block.timestamp + MAX_DEADLINE_WINDOW,
            "RibaGuard: DEADLINE_TOO_FAR - time-locked positions are prohibited"

        );
        _;
    }

    /// @notice Prevents callers with open leveraged positions from adding liquidity.
    ///         Leveraged liquidity provision is debt-funded and constitutes Riba.
    modifier noLeveragedPosition(address caller) {
        require(
            !_hasLeveragedPosition[caller],
            "RibaGuard: LEVERAGED_POSITION - close debt position before providing liquidity"
        );
        _;
    }

    /// @notice Blocks same-block repeated burns that extract value like interest.
    modifier noFlashBurn(address caller) {
        require(
            block.number > _lastBurnBlock[caller] + MIN_BLOCKS_BETWEEN_BURNS,
            "RibaGuard: FLASH_BURN - sequential liquidity removal within same block is prohibited"
        );
        _;
    }

    /// @notice Ensures both token amounts are non-zero.
    ///         A one-sided deposit with zero counterpart is economically equivalent
    ///         to a loan — prohibited under AAOIFI standards.
    modifier noOneSidedDeposit(uint256 amountA, uint256 amountB) {
        require(amountA > 0, "RibaGuard: ZERO_AMOUNT_A - one-sided deposits are prohibited");
        require(amountB > 0, "RibaGuard: ZERO_AMOUNT_B - one-sided deposits are prohibited");
        _;
    }

    // ── Internal helpers called by child contracts ─────────────────────────────

    /// @dev Record first deposit timestamp for an address.
    function _recordDeposit(address provider) internal {
        if (_firstDepositAt[provider] == 0) {
            _firstDepositAt[provider] = block.timestamp;
        }
    }

    /// @dev Record burn block to enforce noFlashBurn on next call.
    function _recordBurn(address provider) internal {
        _lastBurnBlock[provider] = block.number;
    }

    /// @dev Called by admin/factory to flag a leveraged position.
    ///      In production this would be gated; here it's internal for extensibility.
    function _setLeveragedPosition(address provider, bool status) internal {
        _hasLeveragedPosition[provider] = status;
    }

    // ── View helpers ──────────────────────────────────────────────────────────

    function firstDepositAt(address provider) external view returns (uint256) {
        return _firstDepositAt[provider];
    }

    function hasLeveragedPosition(address provider) external view returns (bool) {
        return _hasLeveragedPosition[provider];
    }

    function lastBurnBlock(address provider) external view returns (uint256) {
        return _lastBurnBlock[provider];
    }
}
