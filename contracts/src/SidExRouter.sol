// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {ISidExFactory} from "./interfaces/ISidExFactory.sol";
import {ISidExPair} from "./interfaces/ISidExPair.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {SidExLibrary} from "./libraries/SidExLibrary.sol";
import {RibaGuard} from "./RibaGuard.sol";

/// @title SidExRouter
/// @notice Stateless swap/liquidity router. No margin, no borrowing, no
///         interest-bearing positions — every call settles atomically at the
///         spot price implied by pool reserves (bay' al-sarf style exchange).
///
///         Inherits RibaGuard to enforce AAOIFI Sharia compliance guardrails
///         on every liquidity action.
contract SidExRouter is RibaGuard {
    address public immutable factory;

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "SidEx: EXPIRED");
        _;
    }

    constructor(address _factory) {
        factory = _factory;
    }

    /// @notice Add liquidity to a token pair pool.
    /// @dev    Riba guardrails applied:
    ///         - noFarDeadline:        deadline must be within 2 hours
    ///         - noLeveragedPosition:  caller must not have open debt position
    ///         - noOneSidedDeposit:    both desired amounts must be non-zero
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        external
        ensure(deadline)
        noFarDeadline(deadline)
        noLeveragedPosition(msg.sender)
        noOneSidedDeposit(amountADesired, amountBDesired)
        returns (uint256 amountA, uint256 amountB, uint256 liquidity)
    {
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        address pair = SidExLibrary.pairFor(factory, tokenA, tokenB);
        _safeTransferFrom(tokenA, msg.sender, pair, amountA);
        _safeTransferFrom(tokenB, msg.sender, pair, amountB);
        liquidity = ISidExPair(pair).mint(to);

        // Record deposit for compliance audit trail
        _recordDeposit(msg.sender);
    }

    /// @notice Remove liquidity from a token pair pool.
    /// @dev    Riba guardrails applied:
    ///         - noFarDeadline:   deadline must be within 2 hours
    ///         - noFlashBurn:     cannot burn in consecutive blocks
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        public
        ensure(deadline)
        noFarDeadline(deadline)
        noFlashBurn(msg.sender)
        returns (uint256 amountA, uint256 amountB)
    {
        address pair = SidExLibrary.pairFor(factory, tokenA, tokenB);
        _safeTransferFrom(pair, msg.sender, pair, liquidity);
        (uint256 amount0, uint256 amount1) = ISidExPair(pair).burn(to);
        (address token0,) = SidExLibrary.sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        require(amountA >= amountAMin, "SidEx: INSUFFICIENT_A_AMOUNT");
        require(amountB >= amountBMin, "SidEx: INSUFFICIENT_B_AMOUNT");

        // Record burn for flash-burn prevention on next call
        _recordBurn(msg.sender);
    }

    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) internal returns (uint256 amountA, uint256 amountB) {
        if (ISidExFactory(factory).getPair(tokenA, tokenB) == address(0)) {
            ISidExFactory(factory).createPair(tokenA, tokenB);
        }
        (uint256 reserveA, uint256 reserveB) = SidExLibrary.getReserves(factory, tokenA, tokenB);
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal = SidExLibrary.quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "SidEx: INSUFFICIENT_B_AMOUNT");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = SidExLibrary.quote(amountBDesired, reserveB, reserveA);
                require(amountAOptimal <= amountADesired, "SidEx: EXCESS_A_AMOUNT");
                require(amountAOptimal >= amountAMin, "SidEx: INSUFFICIENT_A_AMOUNT");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    // ── Swaps ─────────────────────────────────────────────────────────────────

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external ensure(deadline) noFarDeadline(deadline) returns (uint256[] memory amounts) {
        amounts = SidExLibrary.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "SidEx: INSUFFICIENT_OUTPUT_AMOUNT");
        _safeTransferFrom(path[0], msg.sender, SidExLibrary.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external ensure(deadline) noFarDeadline(deadline) returns (uint256[] memory amounts) {
        amounts = SidExLibrary.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= amountInMax, "SidEx: EXCESSIVE_INPUT_AMOUNT");
        _safeTransferFrom(path[0], msg.sender, SidExLibrary.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }

    function _swap(uint256[] memory amounts, address[] memory path, address _to) internal {
        for (uint256 i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = SidExLibrary.sortTokens(input, output);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) =
                input == token0 ? (uint256(0), amountOut) : (amountOut, uint256(0));
            address to = i < path.length - 2 ? SidExLibrary.pairFor(factory, output, path[i + 2]) : _to;
            ISidExPair(SidExLibrary.pairFor(factory, input, output)).swap(amount0Out, amount1Out, to, "");
        }
    }

    // ── View helpers ──────────────────────────────────────────────────────────

    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) external pure returns (uint256 amountB) {
        return SidExLibrary.quote(amountA, reserveA, reserveB);
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        external
        pure
        returns (uint256 amountOut)
    {
        return SidExLibrary.getAmountOut(amountIn, reserveIn, reserveOut);
    }

    function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory) {
        return SidExLibrary.getAmountsOut(factory, amountIn, path);
    }

    function getAmountsIn(uint256 amountOut, address[] calldata path) external view returns (uint256[] memory) {
        return SidExLibrary.getAmountsIn(factory, amountOut, path);
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    function _safeTransferFrom(address token, address from, address to, uint256 value) internal {
        (bool ok, bytes memory data) =
            token.call(abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, value));
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "SidEx: TRANSFER_FROM_FAILED");
    }
}
