// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Pemilu.sol";

contract DeployPemilu is Script {
    function run() public returns (Pemilu) {
        // Start broadcasting transactions
        vm.startBroadcast();

        // Deploy the contract
        Pemilu pemilu = new Pemilu();

        // Stop broadcasting
        vm.stopBroadcast();

        return pemilu;
    }
} 