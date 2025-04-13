// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/access/AccessControl.sol";

// contract Pemilu-bck is AccessControl {
//     bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
//     struct Candidate {
//         string name;
//         uint voteCount;
//     }

//     struct Voter {
//         bool isVoted;   
//         string name;
//     }

//     Candidate[] private candidates;
//     mapping(address => Voter) private voters;
//     uint private totalVoters;
//     bool private votingOpen;

//     event CandidateAdded(string indexed name, uint indexed candidateId);
//     event VoterRegistered(address indexed voter, string name);
//     event VoteCasted(address indexed voter, uint indexed candidateId, uint timestamp);
//     event VotingStatusChanged(bool indexed isOpen);
//     event ContractDeployed(address indexed admin, uint timestamp);

//     constructor() payable {
//         _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
//         _grantRole(ADMIN_ROLE, msg.sender);
//         votingOpen = false;
        
//         emit ContractDeployed(msg.sender, block.timestamp);
//     }

//     function addCandidate(string memory _name) external onlyRole(ADMIN_ROLE) {
//         uint candidateId = candidates.length;
//         Candidate storage newCandidate = candidates.push();
//         newCandidate.name = _name;
        
//         emit CandidateAdded(_name, candidateId);
//     }

//     function startVoting() external onlyRole(ADMIN_ROLE) {
//         votingOpen = true;
//         emit VotingStatusChanged(true);
//     }

//     function stopVoting() external onlyRole(ADMIN_ROLE) {
//         votingOpen = false;
//         emit VotingStatusChanged(false);
//     }

//     function getCandidateCount() external view returns (uint) {
//         return candidates.length;
//     }

//     function getVotingResults() external view returns (Candidate[] memory) {
//         return candidates;
//     }

//     function registerVoter(string memory _name) external {
//         require(!voters[msg.sender].isVoted, "Already registered");
        
//         Voter storage newVoter = voters[msg.sender];
//         newVoter.name = _name;
        
//         totalVoters++;
//         emit VoterRegistered(msg.sender, _name);
//     }

//     function vote(uint _candidateId) external {
//         Voter storage voter = voters[msg.sender];
//         require(!voter.isVoted, "Already voted");
//         require(votingOpen, "Voting is not open");
//         require(_candidateId < candidates.length, "Invalid candidate ID");
        
//         voter.isVoted = true;
        
//         Candidate storage candidate = candidates[_candidateId];
//         candidate.voteCount++;
        
//         emit VoteCasted(msg.sender, _candidateId, block.timestamp);
//     }

//     function getCandidate(uint _candidateId) external view returns (string memory name, uint voteCount) {
//         require(_candidateId < candidates.length, "Invalid candidate ID");
//         Candidate storage candidate = candidates[_candidateId];
//         return (candidate.name, candidate.voteCount);
//     }

//     function getVoterInfo(address _voter) external view returns (bool isVoted, string memory name) {
//         Voter storage voter = voters[_voter];
//         return (voter.isVoted, voter.name);
//     }
// }

// // alur pemilu
// // 1. admin membuat kandidat
// // 2. voter mendaftarkan diri 
// // 3. admin menerima pendaftaran voter
// // 4. voter memilih kandidat
// // 5. admin menghitung voting
// // 6. admin membuat pemenang
// // 7. admin menyimpan pemenang ke dalam blockchain
// // 8. pemenang dinyatakan pemenang
