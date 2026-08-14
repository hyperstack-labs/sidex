// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import "forge-std/Test.sol";
import "../src/SidExFactory.sol";
import "../src/SidExRouter.sol";
import "../src/SidExPair.sol";
import "../src/libraries/SidExLibrary.sol";
import "./mocks/MockERC20.sol";

contract SidExRouterTest is Test {
    SidExFactory factory;
    SidExRouter router;
    MockERC20 tokenA;
    MockERC20 tokenB;
    address lp = address(0xBEEF);
    address trader = address(0xCAFE);

    function setUp() public {
        factory = new SidExFactory(address(this));
        router = new SidExRouter(address(factory));
        tokenA = new MockERC20("A", "A", 18);
        tokenB = new MockERC20("B", "B", 18);

        tokenA.mint(lp, 1_000 ether);
        tokenB.mint(lp, 1_000 ether);
        tokenA.mint(trader, 10 ether);

        vm.startPrank(lp);
        tokenA.approve(address(router), type(uint256).max);
        tokenB.approve(address(router), type(uint256).max);
        router.addLiquidity(address(tokenA), address(tokenB), 1_000 ether, 1_000 ether, 0, 0, lp, block.timestamp);
        vm.stopPrank();
    }

    function _pair() internal view returns (SidExPair) {
        return SidExPair(factory.getPair(address(tokenA), address(tokenB)));
    }

    // ---------------------------------------------------------------
    // Liquidity
    // ---------------------------------------------------------------

    function test_AddLiquidity_MintsLPTokens() public view {
        SidExPair pair = _pair();
        assertGt(pair.balanceOf(lp), 0);
        (uint112 r0, uint112 r1,) = pair.getReserves();
        assertEq(uint256(r0), 1_000 ether);
        assertEq(uint256(r1), 1_000 ether);
    }

    function test_RemoveLiquidity_ReturnsUnderlying() public {
        SidExPair pair = _pair();
        uint256 liquidity = pair.balanceOf(lp);

        vm.startPrank(lp);
        pair.approve(address(router), liquidity);
        (uint256 amountA, uint256 amountB) =
            router.removeLiquidity(address(tokenA), address(tokenB), liquidity, 0, 0, lp, block.timestamp);
        vm.stopPrank();

        assertGt(amountA, 0);
        assertGt(amountB, 0);
        assertEq(pair.balanceOf(lp), 0);
    }

    // ---------------------------------------------------------------
    // Swap math correctness (zero-interest invariants)
    // ---------------------------------------------------------------

    /// @notice Output must match the constant-product formula exactly —
    /// no time-dependent growth (i.e., no interest component).
    function test_SwapMatchesConstantProductFormula() public {
        SidExPair pair = _pair();
        (uint112 r0, uint112 r1,) = pair.getReserves();
        address token0 = pair.token0();
        (uint256 reserveIn, uint256 reserveOut) =
            token0 == address(tokenA) ? (uint256(r0), uint256(r1)) : (uint256(r1), uint256(r0));

        uint256 amountIn = 1 ether;
        uint256 expectedOut = SidExLibrary.getAmountOut(amountIn, reserveIn, reserveOut);

        address[] memory path = new address[](2);
        path[0] = address(tokenA);
        path[1] = address(tokenB);

        vm.startPrank(trader);
        tokenA.approve(address(router), amountIn);
        uint256[] memory amounts = router.swapExactTokensForTokens(amountIn, 0, path, trader, block.timestamp);
        vm.stopPrank();

        assertEq(amounts[1], expectedOut, "output must equal pure spot-price formula, no drift");
    }

    /// @notice The realized fee must equal exactly 0.3% of amountIn — flat and
    /// disclosed, not a variable/compounding rate.
    function test_EffectiveFeeIsFlatPoint3Percent() public view {
        (uint256 reserveIn, uint256 reserveOut) = SidExLibrary.getReserves(address(factory), address(tokenA), address(tokenB));
        uint256 amountIn = 1 ether;

        uint256 amountOutWithFee = SidExLibrary.getAmountOut(amountIn, reserveIn, reserveOut);
        // Frictionless (no-fee) constant product output, for comparison:
        uint256 amountOutNoFee = (amountIn * reserveOut) / (reserveIn + amountIn);

        // amountOutWithFee should be ~0.3% below the frictionless amount.
        uint256 diff = amountOutNoFee - amountOutWithFee;
        uint256 diffBps = (diff * 10_000) / amountOutNoFee;
        assertApproxEqAbs(diffBps, 30, 2, "fee should be ~30bps (0.3%), flat");
    }

    /// @notice k must never decrease across a swap — value only moves via
    /// the disclosed 0.3% fee, never via an accruing rate.
    function test_KInvariantNonDecreasing() public {
        SidExPair pair = _pair();
        (uint112 r0Before, uint112 r1Before,) = pair.getReserves();
        uint256 kBefore = uint256(r0Before) * r1Before;

        address[] memory path = new address[](2);
        path[0] = address(tokenA);
        path[1] = address(tokenB);

        vm.startPrank(trader);
        tokenA.approve(address(router), 1 ether);
        router.swapExactTokensForTokens(1 ether, 0, path, trader, block.timestamp);
        vm.stopPrank();

        (uint112 r0After, uint112 r1After,) = pair.getReserves();
        uint256 kAfter = uint256(r0After) * r1After;
        assertGe(kAfter, kBefore);
    }

    /// @notice Advancing time with no trades must NOT change reserves —
    /// the direct test that there is no interest/yield accrual.
    function test_NoInterestAccrualOverTime() public {
        SidExPair pair = _pair();
        (uint112 r0Before, uint112 r1Before,) = pair.getReserves();

        vm.warp(block.timestamp + 365 days);

        (uint112 r0After, uint112 r1After,) = pair.getReserves();
        assertEq(r0Before, r0After, "reserves must not grow with time alone");
        assertEq(r1Before, r1After, "reserves must not grow with time alone");
    }

    /// @notice Repeated swaps must remain path-independent per-trade: the fee
    /// rate applied never changes based on duration held, position size over time,
    /// or number of prior trades — only current reserves at call time matter.
    function test_FeeRateConstantAcrossRepeatedSwaps() public {
        address[] memory path = new address[](2);
        path[0] = address(tokenA);
        path[1] = address(tokenB);

        tokenA.mint(trader, 100 ether);
        vm.startPrank(trader);
        tokenA.approve(address(router), type(uint256).max);

        for (uint256 i; i < 3; i++) {
            (uint256 reserveIn, uint256 reserveOut) =
                SidExLibrary.getReserves(address(factory), address(tokenA), address(tokenB));
            uint256 expectedOut = SidExLibrary.getAmountOut(1 ether, reserveIn, reserveOut);
            uint256[] memory amounts = router.swapExactTokensForTokens(1 ether, 0, path, trader, block.timestamp);
            assertEq(amounts[1], expectedOut);
            vm.warp(block.timestamp + 10 days); // time passing must not affect the formula
        }
        vm.stopPrank();
    }

    function test_RevertWhen_SlippageExceeded() public {
        address[] memory path = new address[](2);
        path[0] = address(tokenA);
        path[1] = address(tokenB);

        vm.startPrank(trader);
        tokenA.approve(address(router), 1 ether);
        vm.expectRevert(bytes("SidEx: INSUFFICIENT_OUTPUT_AMOUNT"));
        router.swapExactTokensForTokens(1 ether, type(uint256).max, path, trader, block.timestamp);
        vm.stopPrank();
    }

    function test_RevertWhen_DeadlineExpired() public {
        address[] memory path = new address[](2);
        path[0] = address(tokenA);
        path[1] = address(tokenB);

        vm.startPrank(trader);
        tokenA.approve(address(router), 1 ether);
        vm.expectRevert(bytes("SidEx: EXPIRED"));
        router.swapExactTokensForTokens(1 ether, 0, path, trader, block.timestamp - 1);
        vm.stopPrank();
    }
}
