// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {SidExPair} from "./SidExPair.sol";
import {ISidExFactory} from "./interfaces/ISidExFactory.sol";

/// @title SidExFactory
/// @notice Creates and indexes token-pair pools. No lending/interest logic —
///         purely a registry + deterministic pair deployer (spot exchange only).
contract SidExFactory is ISidExFactory {
    address public feeTo;       // optional protocol fee recipient (share of trading fee, not interest)
    address public feeToSetter;

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    constructor(address _feeToSetter) {
        feeToSetter = _feeToSetter;
    }

    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }

    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "SidEx: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "SidEx: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "SidEx: PAIR_EXISTS");

        bytes memory bytecode = type(SidExPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        SidExPair(pair).initialize(token0, token1);

        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // symmetric lookup
        allPairs.push(pair);

        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, "SidEx: FORBIDDEN");
        feeTo = _feeTo;
    }

    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, "SidEx: FORBIDDEN");
        feeToSetter = _feeToSetter;
    }
}
