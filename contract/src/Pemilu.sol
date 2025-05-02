// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Pemilu is Ownable {
    // ============ State Variables ============
    uint public startTime;
    uint public endTime;
    uint public candidateCount;
    
    // Mappings
    mapping(uint => bool) private idExists;
    mapping(uint => Candidate) public candidates;
    mapping(address => Voter) public voters;
    mapping(address => bool) public admins;
    
    // Arrays
    address[] private registeredVoters;

    // ============ Structs ============
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
        string imageCID;
    }
    
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint voteCandidateId;
    }

    // ============ Events ============
    // Admin Events
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    
    // Candidate Events
    event CandidateAdded(uint id, string name, string imageCID);
    event CandidateRemoved(uint id, string name);
    
    // Voter Events
    event VoterRegistered(address indexed voter);
    event VoterRemoved(address indexed voter);
    event Voted(address indexed voter, uint candidateId);
    
    // Voting Events
    event WinnerDeclared(uint id, string name, uint voteCount);

    // ============ Modifiers ============
    modifier onlyAdmin() {
        require(admins[msg.sender] || owner() == msg.sender, "Not an admin");
        _;
    }

    modifier onlyDuringVoting() {
        require(startTime != 0 && endTime != 0, "Waktu pemilihan belum diatur");
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Pemilihan tidak aktif");
        _;
    }
    
    modifier onlyAfterVoting() {
        require(block.timestamp > endTime, "Pemilihan belum berakhir");
        _;
    }

    // ============ Constructor ============
    constructor() Ownable(msg.sender) {
        admins[msg.sender] = true;
        emit AdminAdded(msg.sender);
    }

    // ============ Owner Functions ============
    function addAdmin(address _newAdmin) public onlyOwner {
        require(_newAdmin != address(0), "Invalid address");
        require(!admins[_newAdmin], "Already an admin");
        admins[_newAdmin] = true;
        emit AdminAdded(_newAdmin);
    }

    // ============ Admin Functions ============
    function removeAdmin(address _admin) public onlyAdmin {
        require(_admin != owner(), "Cannot remove owner from admin");
        require(admins[_admin], "Not an admin");
        admins[_admin] = false;
        emit AdminRemoved(_admin);
    }

    function addCandidate(string memory _name, string memory _imageCID) public onlyAdmin {
        uint id = generateId();
        while (idExists[id]) {
            id = uint(keccak256(abi.encodePacked(id, block.prevrandao))) % 10**10;
        }

        candidateCount++;
        idExists[id] = true;
        candidates[id] = Candidate(id, _name, 0, _imageCID);
        emit CandidateAdded(id, _name, _imageCID);
    }

    function removeCandidate(uint _candidateId) public onlyAdmin {
        require(candidates[_candidateId].id != 0, "Kandidat tidak ditemukan");
        require(candidates[_candidateId].voteCount == 0, "Tidak dapat menghapus kandidat yang sudah memiliki suara");
        
        string memory candidateName = candidates[_candidateId].name;
        delete candidates[_candidateId];
        idExists[_candidateId] = false;
        candidateCount--;
        
        emit CandidateRemoved(_candidateId, candidateName);
    }

    function removeVoter(address _voterAddress) public onlyAdmin {
        require(voters[_voterAddress].isRegistered, "Pemilih tidak terdaftar");
        require(!voters[_voterAddress].hasVoted, "Tidak dapat menghapus pemilih yang sudah memilih");
        
        delete voters[_voterAddress];
        emit VoterRemoved(_voterAddress);
    }

    function setVotingPeriod(uint _startTime, uint _endTime) public onlyAdmin {
        require(_startTime < _endTime, "Waktu mulai harus lebih awal dari waktu berakhir");
        require(block.timestamp < _startTime, "Waktu mulai tidak boleh sudah berlalu");
        startTime = _startTime;
        endTime = _endTime;
    }

    function getVoteCount(uint _candidateId) public view onlyAdmin returns (uint) {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Kandidat tidak valid");
        return candidates[_candidateId].voteCount;
    }

    // ============ Voter Functions ============
    function registerAsVoter() public {
        require(!voters[msg.sender].isRegistered, "Sudah terdaftar");
        voters[msg.sender].isRegistered = true;
        registeredVoters.push(msg.sender);
        emit VoterRegistered(msg.sender);
    }

    function vote(uint _candidateId) public onlyDuringVoting {
        Voter storage sender = voters[msg.sender];
        require(sender.isRegistered, "Anda tidak terdaftar sebagai pemilih");
        require(!sender.hasVoted, "Sudah memilih");
        require(candidates[_candidateId].id != 0, "Kandidat tidak valid");

        sender.hasVoted = true;
        sender.voteCandidateId = _candidateId;
        candidates[_candidateId].voteCount++;

        emit Voted(msg.sender, _candidateId);
    }

    // ============ Public View Functions ============
    function isAdmin(address _address) public view returns (bool) {
        return admins[_address] || owner() == _address;
    }

    function getCandidateDetails(uint _candidateId) public view returns (
        uint id,
        string memory name,
        uint voteCount,
        string memory imageCID
    ) {
        require(candidates[_candidateId].id != 0, "Kandidat tidak ditemukan");
        Candidate memory candidate = candidates[_candidateId];
        return (candidate.id, candidate.name, candidate.voteCount, candidate.imageCID);
    }

    function getAllCandidates() public view returns (
        uint[] memory ids,
        string[] memory names,
        uint[] memory voteCounts,
        string[] memory imageCIDs
    ) {
        uint[] memory candidateIds = new uint[](candidateCount);
        string[] memory candidateNames = new string[](candidateCount);
        uint[] memory candidateVoteCounts = new uint[](candidateCount);
        string[] memory candidateImageCIDs = new string[](candidateCount);
        
        uint index = 0;
        for (uint i = 1; i <= candidateCount; i++) {
            if (candidates[i].id != 0) {
                candidateIds[index] = candidates[i].id;
                candidateNames[index] = candidates[i].name;
                candidateVoteCounts[index] = candidates[i].voteCount;
                candidateImageCIDs[index] = candidates[i].imageCID;
                index++;
            }
        }
        
        return (candidateIds, candidateNames, candidateVoteCounts, candidateImageCIDs);
    }

    function getAllVotersDetails() public view returns (
        address[] memory addresses,
        bool[] memory isRegistered,
        bool[] memory hasVoted,
        uint[] memory voteCandidateIds
    ) {
        uint totalVoters = registeredVoters.length;
        
        address[] memory voterAddresses = new address[](totalVoters);
        bool[] memory voterIsRegistered = new bool[](totalVoters);
        bool[] memory voterHasVoted = new bool[](totalVoters);
        uint[] memory voterCandidateIds = new uint[](totalVoters);
        
        for (uint i = 0; i < totalVoters; i++) {
            address voterAddress = registeredVoters[i];
            Voter memory voter = voters[voterAddress];
            
            voterAddresses[i] = voterAddress;
            voterIsRegistered[i] = voter.isRegistered;
            voterHasVoted[i] = voter.hasVoted;
            voterCandidateIds[i] = voter.voteCandidateId;
        }
        
        return (voterAddresses, voterIsRegistered, voterHasVoted, voterCandidateIds);
    }

    function getVoterDetails(address _voterAddress) public view returns (
        bool isRegistered,
        bool hasVoted,
        uint voteCandidateId
    ) {
        Voter memory voter = voters[_voterAddress];
        return (voter.isRegistered, voter.hasVoted, voter.voteCandidateId);
    }

    function getTotalRegisteredVoters() public view returns (uint) {
        return registeredVoters.length;
    }

    function getCandidateCount() public view returns (uint) {
        return candidateCount;
    }

    function getVotingPeriod() public view returns (uint _startTime, uint _endTime) {
        return (startTime, endTime);
    }

    function getWinner() public onlyAfterVoting returns (uint id, string memory name, uint voteCount) {
        uint maxVotes = 0;
        uint winnerId = 0;

        for (uint i = 1; i <= candidateCount; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerId = i;
            }
        }
        
        Candidate memory winner = candidates[winnerId];
        emit WinnerDeclared(winner.id, winner.name, winner.voteCount);
        return (winnerId, winner.name, winner.voteCount);
    }

    // ============ Private Functions ============
    function generateId() private view returns (uint) {
        uint randomId = uint(keccak256(abi.encodePacked(msg.sender, block.timestamp, candidateCount))) % 10**10;
        return randomId;
    }
}