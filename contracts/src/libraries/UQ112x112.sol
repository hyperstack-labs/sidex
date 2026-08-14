// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

/// @dev Fixed point 112.112 arithmetic, used only for TWAP price accumulators
///      (oracle data), not for any interest/yield calculation.
library UQ112x112 {
    uint224 constant Q112 = 2 ** 112;

    function encode(uint112 y) internal pure returns (uint224 z) {
        z = uint224(y) * Q112;
    }

    function uqdiv(uint224 x, uint112 y) internal pure returns (uint224 z) {
        z = x / uint224(y);
    }
}
