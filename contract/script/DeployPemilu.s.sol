// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Pemilu.sol";

contract DeployPemilu is Script {
    function setUp() public {}

    function run() public {
        // Start broadcasting transaction from deployer wallet
        vm.startBroadcast();

        // Deploy the Pemilu contract
        Pemilu pemilu = new Pemilu();

        // Opsional: langsung tambahkan kandidat
        pemilu.addCandidate("Alice", "imageCID");
        pemilu.addCandidate("Bob", "imageCID");

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
