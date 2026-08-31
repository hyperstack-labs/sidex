// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import "forge-std/Test.sol";
import {SidExFactory} from "../src/SidExFactory.sol";
import {SidExRouter}  from "../src/SidExRouter.sol";
import {SidExPair}    from "../src/SidExPair.sol";
import {MockERC20}    from "./mocks/MockERC20.sol";

/// @title LiquidityPool Integration Tests
/// @notice Verifies LP token minted amounts, Riba guardrail enforcement,
///         and remove-liquidity proportional withdrawals.
contract LiquidityPoolTest is Test {

    SidExFactory factory;
    SidExRouter  router;
    MockERC20    tokenA;
    MockERC20    tokenB;

    // ── Test accounts ─────────────────────────────────────────────────────────
    address alice = makeAddr("alice");
    address bob   = makeAddr("bob");

    // ── Constants ─────────────────────────────────────────────────────────────
    uint256 constant INITIAL_SUPPLY  = 1_000_000e18;
    uint256 constant LIQUIDITY_A     = 100_000e18;
    uint256 constant LIQUIDITY_B     = 100_000e18;
    uint256 constant MINIMUM_LIQUIDITY = 1_000; // SidExPair.MINIMUM_LIQUIDITY

    // ── Setup ─────────────────────────────────────────────────────────────────

    function setUp() public {
        // Deploy core contracts
        factory = new SidExFactory(address(this));
        router  = new SidExRouter(address(factory));

        // Deploy mock tokens
        tokenA = new MockERC20("Token A", "TKNA", 18);
        tokenB = new MockERC20("Token B", "TKNB", 18);

        // Fund alice and bob
        tokenA.mint(alice, INITIAL_SUPPLY);
        tokenB.mint(alice, INITIAL_SUPPLY);
        tokenA.mint(bob,   INITIAL_SUPPLY);
        tokenB.mint(bob,   INITIAL_SUPPLY);

        // Approve router from both accounts
        vm.startPrank(alice);
        tokenA.approve(address(router), type(uint256).max);
        tokenB.approve(address(router), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(bob);
        tokenA.approve(address(router), type(uint256).max);
        tokenB.approve(address(router), type(uint256).max);
        vm.stopPrank();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /// @dev Returns a deadline 1 hour from now (within RibaGuard's 2-hour window).
    function _deadline() internal view returns (uint256) {
        return block.timestamp + 1 hours;
    }

    /// @dev Returns address of the pair for tokenA/tokenB (creates it if needed).
    function _getPair() internal view returns (SidExPair) {
        address pair = factory.getPair(address(tokenA), address(tokenB));
        return SidExPair(pair);
    }


    function test_addLiquidity_initialMint_lpTokensCorrect() public {
        vm.prank(alice);
        (uint256 amtA, uint256 amtB, uint256 liquidity) = router.addLiquidity(
            address(tokenA), address(tokenB),
            LIQUIDITY_A, LIQUIDITY_B,
            0, 0,
            alice,
            _deadline()
        );

        SidExPair pair = _getPair();

        // Amounts deposited match desired (first deposit, no existing reserves)
        assertEq(amtA, LIQUIDITY_A, "amountA mismatch");
        assertEq(amtB, LIQUIDITY_B, "amountB mismatch");

        // LP tokens = sqrt(amtA * amtB) - MINIMUM_LIQUIDITY
        uint256 expectedLiquidity = _sqrt(LIQUIDITY_A * LIQUIDITY_B) - MINIMUM_LIQUIDITY;
        assertEq(liquidity, expectedLiquidity, "LP token amount mismatch");

        // Alice holds the LP tokens
        assertEq(pair.balanceOf(alice), expectedLiquidity, "alice LP balance wrong");

        // Minimum liquidity permanently locked in dead address
        assertEq(pair.balanceOf(address(0xdead)), MINIMUM_LIQUIDITY, "minimum liquidity not locked");
    }

    function test_addLiquidity_initialMint_reservesUpdated() public {
        vm.prank(alice);
        router.addLiquidity(
            address(tokenA), address(tokenB),
            LIQUIDITY_A, LIQUIDITY_B,
            0, 0, alice, _deadline()
        );

        (uint112 r0, uint112 r1,) = _getPair().getReserves();
        // token0 is the lower address — just check total reserves are correct
        assertEq(uint256(r0) + uint256(r1), LIQUIDITY_A + LIQUIDITY_B, "reserve sum wrong");
    }

    function test_addLiquidity_subsequentMint_proportional() public {
        // Alice seeds the pool
        vm.prank(alice);
        (,, uint256 aliceLiquidity) = router.addLiquidity(
            address(tokenA), address(tokenB),
            LIQUIDITY_A, LIQUIDITY_B,
            0, 0, alice, _deadline()
        );

        SidExPair pair = _getPair();
        uint256 totalSupplyBefore = pair.totalSupply();

        // Bob adds the same amounts
        vm.prank(bob);
        (,, uint256 bobLiquidity) = router.addLiquidity(
            address(tokenA), address(tokenB),
            LIQUIDITY_A, LIQUIDITY_B,
            0, 0, bob, _deadline()
        );

        // Bob gets aliceLiquidity + MINIMUM_LIQUIDITY because Alice's first deposit
        // had MINIMUM_LIQUIDITY permanently burned — Bob's does not.
        assertEq(bobLiquidity, aliceLiquidity + MINIMUM_LIQUIDITY, "Bob LP should equal Alice LP + MINIMUM_LIQUIDITY");
        assertEq(pair.totalSupply(), totalSupplyBefore + bobLiquidity, "total supply wrong after second deposit");
    }

    function test_addLiquidity_halfDeposit_halfLpTokens() public {
        // Alice seeds
        vm.prank(alice);
        (,, uint256 aliceLiquidity) = router.addLiquidity(
            address(tokenA), address(tokenB),
            LIQUIDITY_A, LIQUIDITY_B,
            0, 0, alice, _deadline()
        );

        // Bob deposits half
        vm.prank(bob);
        (,, uint256 bobLiquidity) = router.addLiquidity(
            address(tokenA), address(tokenB),
            LIQUIDITY_A / 2, LIQUIDITY_B / 2,
            0, 0, bob, _deadline()
        );

        // Bob gets ~half of alice's LP tokens (ignoring MINIMUM_LIQUIDITY rounding)
        assertApproxEqRel(bobLiquidity, aliceLiquidity / 2, 1e15, "Bob LP should be ~half of Alice's");
    }


    function test_removeLiquidity_fullWithdrawal_returnsTokens() public {
        vm.prank(alice);
        (,, uint256 liquidity) = router.addLiquidity(
            address(tokenA), address(tokenB),
            LIQUIDITY_A, LIQUIDITY_B,
            0, 0, alice, _deadline()
        );

        SidExPair pair = _getPair();

        // Approve pair LP tokens to router
        vm.startPrank(alice);
        pair.approve(address(router), liquidity);

        // Roll one block forward to pass noFlashBurn guard
        vm.roll(block.number + 2);

        uint256 balABefore = tokenA.balanceOf(alice);
        uint256 balBBefore = tokenB.balanceOf(alice);

        (uint256 amtA, uint256 amtB) = router.removeLiquidity(
            address(tokenA), address(tokenB),
            liquidity, 0, 0, alice, _deadline()
        );
        vm.stopPrank();

        // Alice received tokens back
        assertGt(amtA, 0, "amountA returned should be > 0");
        assertGt(amtB, 0, "amountB returned should be > 0");
        assertEq(tokenA.balanceOf(alice), balABefore + amtA, "tokenA balance mismatch");
        assertEq(tokenB.balanceOf(alice), balBBefore + amtB, "tokenB balance mismatch");

        // LP tokens burned
        assertEq(pair.balanceOf(alice), 0, "alice LP balance should be 0 after full removal");
    }

    function test_removeLiquidity_halfWithdrawal_halfTokens() public {
        vm.prank(alice);
        (,, uint256 liquidity) = router.addLiquidity(
            address(tokenA), address(tokenB),
            LIQUIDITY_A, LIQUIDITY_B,
            0, 0, alice, _deadline()
        );

        SidExPair pair = _getPair();

        vm.startPrank(alice);
        pair.approve(address(router), liquidity);
        vm.roll(block.number + 2);

        // Remove half
        (uint256 amtA,) = router.removeLiquidity(
            address(tokenA), address(tokenB),
            liquidity / 2, 0, 0, alice, _deadline()
        );
        vm.stopPrank();

        // Should get back ~half of deposited tokenA (minus MINIMUM_LIQUIDITY effect)
        assertApproxEqRel(amtA, LIQUIDITY_A / 2, 1e15, "should receive ~half of tokenA back");
    }


    /// @notice Deadline more than 2 hours away must revert.
    function test_ribaGuard_farDeadline_reverts() public {
        vm.prank(alice);
        vm.expectRevert(bytes("RibaGuard: DEADLINE_TOO_FAR - time-locked positions are prohibited"));
        router.addLiquidity(
            address(tokenA), address(tokenB),
            LIQUIDITY_A, LIQUIDITY_B,
            0, 0, alice,
            block.timestamp + 3 hours  // exceeds MAX_DEADLINE_WINDOW
        );
    }

    /// @notice Zero amountA must revert with one-sided deposit error.
    function test_ribaGuard_zeroAmountA_reverts() public {
        vm.prank(alice);
        vm.expectRevert(bytes("RibaGuard: ZERO_AMOUNT_A - one-sided deposits are prohibited"));
        router.addLiquidity(
            address(tokenA), address(tokenB),
            0, LIQUIDITY_B,            // amountADesired = 0
            0, 0, alice, _deadline()
        );
    }

    /// @notice Zero amountB must revert with one-sided deposit error.
    function test_ribaGuard_zeroAmountB_reverts() public {
        vm.prank(alice);
        vm.expectRevert(bytes("RibaGuard: ZERO_AMOUNT_B - one-sided deposits are prohibited"));

        router.addLiquidity(
            address(tokenA), address(tokenB),
            LIQUIDITY_A, 0,            // amountBDesired = 0
            0, 0, alice, _deadline()
        );
    }

    /// @notice Flash-burn: removing liquidity twice in consecutive blocks must revert second call.
    function test_ribaGuard_flashBurn_reverts() public {
        // Alice adds liquidity
        vm.prank(alice);
        (,, uint256 liquidity) = router.addLiquidity(
            address(tokenA), address(tokenB),
            LIQUIDITY_A, LIQUIDITY_B,
            0, 0, alice, _deadline()
        );

        SidExPair pair = _getPair();

        vm.startPrank(alice);
        pair.approve(address(router), liquidity);
        vm.roll(block.number + 2);

        router.removeLiquidity(
            address(tokenA), address(tokenB),
            liquidity / 4, 0, 0, alice, _deadline()
        );

        vm.roll(block.number + 1);
        vm.expectRevert(bytes("RibaGuard: FLASH_BURN - sequential liquidity removal within same block is prohibited"));
        router.removeLiquidity(
            address(tokenA), address(tokenB),
            liquidity / 4, 0, 0, alice, _deadline()
        );
        vm.stopPrank();
    }

    /// @notice Expired deadline must revert.
    function test_ensure_expiredDeadline_reverts() public {
        vm.warp(block.timestamp + 2 hours);
        vm.prank(alice);
        vm.expectRevert(bytes("SidEx: EXPIRED"));
        router.addLiquidity(
            address(tokenA), address(tokenB),
            LIQUIDITY_A, LIQUIDITY_B,
            0, 0, alice,
            block.timestamp - 1  // already expired
        );
    }


    function test_addLiquidity_createsPairIfNotExists() public {
        assertEq(factory.getPair(address(tokenA), address(tokenB)), address(0), "pair should not exist yet");

        vm.prank(alice);
        router.addLiquidity(
            address(tokenA), address(tokenB),
            LIQUIDITY_A, LIQUIDITY_B,
            0, 0, alice, _deadline()
        );

        assertTrue(factory.getPair(address(tokenA), address(tokenB)) != address(0), "pair should exist after addLiquidity");
        assertEq(factory.allPairsLength(), 1, "factory should track one pair");
    }

    function test_addLiquidity_doesNotDuplicatePair() public {
        vm.prank(alice);
        router.addLiquidity(address(tokenA), address(tokenB), LIQUIDITY_A, LIQUIDITY_B, 0, 0, alice, _deadline());

        vm.prank(bob);
        router.addLiquidity(address(tokenA), address(tokenB), LIQUIDITY_A, LIQUIDITY_B, 0, 0, bob, _deadline());

        assertEq(factory.allPairsLength(), 1, "should still be only one pair");
    }

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) { z = x; x = (y / x + x) / 2; }
        } else if (y != 0) {
            z = 1;
        }
    }
}
