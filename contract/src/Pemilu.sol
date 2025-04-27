// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Pemilu is Ownable {
    uint public startTime;
    uint public endTime;

    // Struktur kandidat
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
        string imageCID;
    }
    
    // Struktur pemilih
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint voteCandidateId;
    }

    // Jumlah kandidat
    uint public candidateCount;
    
    mapping(uint => bool) private idExists; // Untuk memastikan ID unik
    // Data kandidat dan pemilih
    mapping(uint => Candidate) public candidates;
    mapping(address => Voter) public voters;
    // Array to track all registered voter addresses
    address[] private registeredVoters;
    // Mapping untuk menyimpan daftar admin
    mapping(address => bool) public admins;

    event CandidateAdded(uint id, string name, string imageCID);
    event VoterRegistered(address indexed voter);
    event Voted(address indexed voter, uint candidateId);
    event WinnerDeclared(uint id, string name, uint voteCount);
    // Event untuk admin management
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    // Event untuk penghapusan kandidat dan pemilih
    event CandidateRemoved(uint id, string name);
    event VoterRemoved(address indexed voter);

    // Modifier untuk mengecek apakah address adalah admin
    modifier onlyAdmin() {
        require(admins[msg.sender] || owner() == msg.sender, "Not an admin");
        _;
    }

    function generateId() private view returns (uint) {
        uint randomId = uint(keccak256(abi.encodePacked(msg.sender, block.timestamp, candidateCount))) % 10**10;
        return randomId;
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
    function addCandidate(string memory _name, string memory _imageCID) public onlyAdmin {
        uint id = generateId();

        // Pastikan ID unik dengan rehash jika sudah ada
        while (idExists[id]) {
            id = uint(keccak256(abi.encodePacked(id, block.prevrandao))) % 10**10;
        }

        candidateCount++;
        idExists[id] = true;  // Mark this ID as used
        candidates[id] = Candidate(id, _name, 0, _imageCID);
        emit CandidateAdded(id, _name, _imageCID);  // Use the generated id instead of candidateCount
    }

    // Fungsi voter untuk mendaftar ke sistem
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
        require(candidates[_candidateId].id != 0, "Kandidat tidak valid");  // Check if candidate exists using the ID map

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
        require(startTime != 0 && endTime != 0, "Waktu pemilihan belum diatur");
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Pemilihan tidak aktif");
        _;
    }
    
    modifier onlyAfterVoting() {
        require(block.timestamp > endTime, "Pemilihan belum berakhir");
        _;
    }

    // Fungsi untuk menghapus kandidat (hanya admin)
    function removeCandidate(uint _candidateId) public onlyAdmin {
        require(candidates[_candidateId].id != 0, "Kandidat tidak ditemukan");
        require(candidates[_candidateId].voteCount == 0, "Tidak dapat menghapus kandidat yang sudah memiliki suara");
        
        string memory candidateName = candidates[_candidateId].name;
        
        // Hapus data kandidat
        delete candidates[_candidateId];
        idExists[_candidateId] = false;
        candidateCount--;
        
        emit CandidateRemoved(_candidateId, candidateName);
    }

    // Fungsi untuk menghapus pemilih (hanya admin)
    function removeVoter(address _voterAddress) public onlyAdmin {
        require(voters[_voterAddress].isRegistered, "Pemilih tidak terdaftar");
        require(!voters[_voterAddress].hasVoted, "Tidak dapat menghapus pemilih yang sudah memilih");
        
        // Hapus data pemilih
        delete voters[_voterAddress];
        
        emit VoterRemoved(_voterAddress);
    }

    // Fungsi untuk mendapatkan detail kandidat
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

    // Function to get all registered voters
    function getAllVoters() public view returns (address[] memory) {
        return registeredVoters;
    }

    // Function to get voter details
    function getVoterDetails(address _voterAddress) public view returns (bool isRegistered, bool hasVoted, uint voteCandidateId) {
        Voter memory voter = voters[_voterAddress];
        return (voter.isRegistered, voter.hasVoted, voter.voteCandidateId);
    }

    // Function to get total number of registered voters
    function getTotalRegisteredVoters() public view returns (uint) {
        return registeredVoters.length;
    }
}