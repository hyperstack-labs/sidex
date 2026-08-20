// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import "forge-std/Test.sol";
import "../src/SidExFactory.sol";
import "../src/SidExPair.sol";
import "./mocks/MockERC20.sol";

contract SidExFactoryTest is Test {
    SidExFactory factory;
    MockERC20 tokenA;
    MockERC20 tokenB;

    function setUp() public {
        factory = new SidExFactory(address(this));
        tokenA = new MockERC20("A", "A", 18);
        tokenB = new MockERC20("B", "B", 18);
    }

    function test_CreatePair() public {
        address pair = factory.createPair(address(tokenA), address(tokenB));
        assertTrue(pair != address(0));
        assertEq(factory.allPairsLength(), 1);
        assertEq(factory.getPair(address(tokenA), address(tokenB)), pair);
        assertEq(factory.getPair(address(tokenB), address(tokenA)), pair);
    }

    function test_RevertWhen_IdenticalAddresses() public {
        vm.expectRevert(bytes("SidEx: IDENTICAL_ADDRESSES"));
        factory.createPair(address(tokenA), address(tokenA));
    }

    function test_RevertWhen_PairExists() public {
        factory.createPair(address(tokenA), address(tokenB));
        vm.expectRevert(bytes("SidEx: PAIR_EXISTS"));
        factory.createPair(address(tokenA), address(tokenB));
    }

    function test_RevertWhen_ZeroAddress() public {
        vm.expectRevert(bytes("SidEx: ZERO_ADDRESS"));
        factory.createPair(address(0), address(tokenB));
    }

    function test_PairTokensSortedDeterministically() public {
        address pair = factory.createPair(address(tokenB), address(tokenA));
        (address token0, address token1) = address(tokenA) < address(tokenB)
            ? (address(tokenA), address(tokenB))
            : (address(tokenB), address(tokenA));
        assertEq(SidExPair(pair).token0(), token0);
        assertEq(SidExPair(pair).token1(), token1);
    }

    function test_OnlyFeeToSetterCanSetFeeTo() public {
        vm.prank(address(0xBEEF));
        vm.expectRevert(bytes("SidEx: FORBIDDEN"));
        factory.setFeeTo(address(0xBEEF));

        factory.setFeeTo(address(0xCAFE));
        assertEq(factory.feeTo(), address(0xCAFE));
    }
}
