// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Pemilu.sol";

contract PemiluTest is Test {
    Pemilu pemilu;

    address owner;
    address voter1;
    address voter2;

    function setUp() public {
    owner = address(this);         // test contract = owner
    voter1 = vm.addr(1);           // voter terisolasi
    voter2 = vm.addr(2);

    pemilu = new Pemilu();
}

    function test_addCandidate() public {
        pemilu.addCandidate("Candidate 1", "imageCID");

        (uint id, string memory name, uint voteCount, string memory imageCID) = pemilu.candidates(1);

        assertEq(id, 1);
        assertEq(name, "Candidate 1");
        assertEq(voteCount, 0);
        assertEq(imageCID, "imageCID");
    }

    function test_register_and_vote() public {
        pemilu.addCandidate("Candidate 1", "imageCID");

        uint startTime = block.timestamp + 1;   
        uint endTime = startTime + 100;
        pemilu.setVotingPeriod(startTime, endTime);

        vm.warp(startTime + 1);

        vm.prank(voter1);
        pemilu.registerAsVoter();

        vm.prank(voter1);
        pemilu.vote(1);

        (,, uint votes, string memory imageCID) = pemilu.candidates(1);
        assertEq(votes, 1);
        assertEq(imageCID, "imageCID");
    }

    function test_double_vote() public {
        pemilu.addCandidate("Candidate 1", "imageCID");

        uint startTime = block.timestamp + 1;
        uint endTime = startTime + 100;
        pemilu.setVotingPeriod(startTime, endTime);

        vm.warp(startTime + 1);

        vm.prank(voter1);
        pemilu.registerAsVoter();

        vm.prank(voter1);
        pemilu.vote(1);

        vm.prank(voter1);
        vm.expectRevert("Sudah memilih"); 
        pemilu.vote(1);
    }

}

