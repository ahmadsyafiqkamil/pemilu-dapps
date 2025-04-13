// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Pemilu is Ownable {
    uint public startTime;
    uint public endTime;

    // Mapping untuk menyimpan daftar admin
    mapping(address => bool) public admins;

    // Event untuk admin management
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    // Struktur kandidat
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Struktur pemilih
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint voteCandidateId;
    }

    // Jumlah kandidat
    uint public candidateCount;

    // Data kandidat dan pemilih
    mapping(uint => Candidate) public candidates;
    mapping(address => Voter) public voters;

    event CandidateAdded(uint id, string name);
    event VoterRegistered(address indexed voter);
    event Voted(address indexed voter, uint candidateId);
    event WinnerDeclared(uint id, string name, uint voteCount);

    // Modifier untuk mengecek apakah address adalah admin
    modifier onlyAdmin() {
        require(admins[msg.sender] || owner() == msg.sender, "Not an admin");
        _;
    }

    // Constructor menggunakan Ownable (owner = deployer)
    constructor() Ownable(msg.sender) {
        // Set deployer sebagai admin pertama
        admins[msg.sender] = true;
        emit AdminAdded(msg.sender);
    }

    // Fungsi untuk menambah admin (hanya owner yang bisa)
    function addAdmin(address _newAdmin) public onlyOwner {
        require(_newAdmin != address(0), "Invalid address");
        require(!admins[_newAdmin], "Already an admin");
        admins[_newAdmin] = true;
        emit AdminAdded(_newAdmin);
    }

    // Fungsi untuk menghapus admin (hanya owner yang bisa)
    function removeAdmin(address _admin) public onlyOwner {
        require(_admin != owner(), "Cannot remove owner from admin");
        require(admins[_admin], "Not an admin");
        admins[_admin] = false;
        emit AdminRemoved(_admin);
    }

    // Fungsi untuk mengecek apakah address adalah admin
    function isAdmin(address _address) public view returns (bool) {
        return admins[_address] || owner() == _address;
    }

    // Fungsi hanya untuk admin menambahkan kandidat
    function addCandidate(string memory _name) public onlyAdmin {
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);
        emit CandidateAdded(candidateCount, _name);
    }

    // Fungsi voter untuk mendaftar ke sistem
    function registerAsVoter() public {
        require(!voters[msg.sender].isRegistered, "Sudah terdaftar");
        voters[msg.sender].isRegistered = true;
        emit VoterRegistered(msg.sender);
    }

    function vote(uint _candidateId) public onlyDuringVoting {
        // require(block.timestamp >= startTime && block.timestamp <= endTime, "Pemilihan tidak aktif");

        Voter storage sender = voters[msg.sender];

        require(sender.isRegistered, "Anda tidak terdaftar sebagai pemilih");
        require(!sender.hasVoted, "Sudah memilih");
        require(_candidateId > 0 && _candidateId <= candidateCount, "Kandidat tidak valid");

        sender.hasVoted = true;
        sender.voteCandidateId = _candidateId;
        candidates[_candidateId].voteCount++;

        emit Voted(msg.sender, _candidateId);
    }

    function getVoteCount(uint _candidateId) public view onlyOwner returns (uint) {
    require(_candidateId > 0 && _candidateId <= candidateCount, "Kandidat tidak valid");
    return candidates[_candidateId].voteCount;
}
    function setVotingPeriod(uint _startTime, uint _endTime) public onlyOwner {
        require(_startTime < _endTime, "Waktu mulai harus lebih awal dari waktu berakhir");
        require(block.timestamp < _startTime, "Waktu mulai tidak boleh sudah berlalu");
        startTime = _startTime;
        endTime = _endTime;
    }

    function getWinner() public onlyAfterVoting returns (uint id, string memory name, uint voteCount) {
        // require(block.timestamp > endTime, "Pemilihan belum berakhir");

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

    modifier onlyDuringVoting() {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Pemilihan tidak aktif");
        _;
    }
    modifier onlyAfterVoting() {
        require(block.timestamp > endTime, "Pemilihan belum berakhir");
        _;
    }
}