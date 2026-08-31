// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import "forge-std/Script.sol";
import "../src/SidExFactory.sol";
import "../src/SidExRouter.sol";

/// @notice Usage:
///   forge script script/Deploy.s.sol:Deploy \
///     --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
contract Deploy is Script {
    function run() external returns (SidExFactory factory, SidExRouter router) {
        address feeToSetter = vm.envOr("FEE_TO_SETTER", msg.sender);

        vm.startBroadcast();
        factory = new SidExFactory(feeToSetter);
        router = new SidExRouter(address(factory));
        vm.stopBroadcast();

        console.log("SidExFactory deployed at:", address(factory));
        console.log("SidExRouter  deployed at:", address(router));

        string memory json = string(abi.encodePacked(
            '{"factory":"', vm.toString(address(factory)),
            '","router":"',  vm.toString(address(router)),
            '","chainId":',  vm.toString(block.chainid),
            '}'
        ));
        vm.writeFile("out/deployed-addresses.json", json);
    }
}