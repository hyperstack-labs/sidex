// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

/// @notice Optional callback for flash-swaps. Any fee charged here must be a
///         flat, disclosed spot-exchange fee — never a compounding/time-based rate.
interface ISidExCallee {
    function sidExCall(address sender, uint256 amount0, uint256 amount1, bytes calldata data) external;
}
