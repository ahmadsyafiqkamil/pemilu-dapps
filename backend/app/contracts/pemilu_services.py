import os 
import json
from web3 import Web3
from app.utils import utils

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ABI_PATH = os.path.join(BASE_DIR, 'abis', 'Pemilu.json')

with open(ABI_PATH, 'r') as f:
    abi = json.load(f)

w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL_SEPOLIA")))
if not w3.is_connected():
    raise Exception("Failed to connect to Ethereum node")

contract_address = os.getenv("CONTRACT_ADDRESS_SEPOLIA")
contract = w3.eth.contract(address=contract_address, abi=abi)

# =============================================
# Utility Functions
# =============================================

def build_transact(tx_function, user_address):
    gas_limit, gas_params = utils.get_gas_parameters(tx_function, user_address)
    nonce = w3.eth.get_transaction_count(user_address)

    tx = tx_function.build_transaction({
        "from": user_address,
        "nonce": nonce,
        "gas": gas_limit,
        **gas_params
    })

    # Convert BigNumber/Hex to int before returning as JSON
    tx["gas"] = int(tx["gas"])
    tx["nonce"] = int(tx["nonce"])
    tx["maxFeePerGas"] = int(tx["maxFeePerGas"])
    tx["maxPriorityFeePerGas"] = int(tx["maxPriorityFeePerGas"])
    tx["chainId"] = int(tx["chainId"])
    tx["value"] = int(tx.get("value", 0))

    return tx

# =============================================
# Role Check Functions
# =============================================

def is_contract_owner(address: str) -> bool:
    """Check if the given address is the contract owner"""
    owner = contract.functions.owner().call()
    return Web3.to_checksum_address(address) == Web3.to_checksum_address(owner)

def is_admin(address: str) -> bool:
    """Check if the given address is an admin"""
    return contract.functions.isAdmin(Web3.to_checksum_address(address)).call()

def is_voter(address: str) -> bool:
    """Check if the given address is registered as a voter"""
    try:
        voter_data = contract.functions.voters(Web3.to_checksum_address(address)).call()
        return voter_data[0]  # isRegistered is the first field in Voter struct
    except Exception as e:
        print(f"Error checking voter status for {address}: {str(e)}")
        return False

# =============================================
# Admin Functions
# =============================================

def add_admin(owner_address: str, new_admin_address: str):
    """Add a new admin to the contract"""
    if not is_contract_owner(owner_address):
        raise Exception("Only contract owner can add new admins")
    
    tx_function = contract.functions.addAdmin(Web3.to_checksum_address(new_admin_address))
    return build_transact(tx_function, owner_address)

def remove_admin(owner_address: str, admin_address: str):
    """Remove an admin from the contract"""
    if not is_contract_owner(owner_address):
        raise Exception("Only contract owner can remove admins")
    
    tx_function = contract.functions.removeAdmin(Web3.to_checksum_address(admin_address))
    return build_transact(tx_function, owner_address)

def add_candidate(user_address: str, name: str, imageCID: str):
    """Add a new candidate"""
    if not is_admin(user_address):
        raise Exception("Only admins can add candidates")
        
    tx_function = contract.functions.addCandidate(name, imageCID)
    return build_transact(tx_function, user_address)

def remove_candidate(user_address: str, candidate_id: int):
    """Remove a candidate from the contract"""
    if not is_admin(user_address):
        raise Exception("Only admins can remove candidates")
    
    tx_function = contract.functions.removeCandidate(candidate_id)
    return build_transact(tx_function, user_address)

def remove_voter(user_address: str, voter_address: str):
    """Remove a voter from the contract"""
    if not is_admin(user_address):
        raise Exception("Only admins can remove voters")
    
    tx_function = contract.functions.removeVoter(voter_address)
    return build_transact(tx_function, user_address)

def set_voting_period(user_address: str, start_time: int, end_time: int):
    """Set the voting period"""
    tx_function = contract.functions.setVotingPeriod(start_time, end_time)
    return build_transact(tx_function, user_address)

# =============================================
# Voter Functions
# =============================================

def register_voter(user_address: str):
    """Register a new voter"""
    tx_function = contract.functions.registerAsVoter()
    return build_transact(tx_function, user_address)

def vote(user_address: str, candidate_id: int):
    """Vote for a candidate"""
    tx_function = contract.functions.vote(candidate_id)
    return build_transact(tx_function, user_address)

# =============================================
# Query Functions
# =============================================

def get_all_candidates():
    """Get all candidates from the contract"""
    candidate_count = contract.functions.candidateCount().call()
    candidates = []
    
    # Get the event signature for both add and remove events
    add_event_signature = "0x" + w3.keccak(text="CandidateAdded(uint256,string,string)").hex().lstrip("0x")
    remove_event_signature = "0x" + w3.keccak(text="CandidateRemoved(uint256,string)").hex().lstrip("0x")
    
    # Get logs for candidate additions
    add_logs = w3.eth.get_logs({
        'address': contract_address,
        'topics': [add_event_signature],
        'fromBlock': 0,
        'toBlock': 'latest'
    })
    
    # Get logs for candidate removals
    remove_logs = w3.eth.get_logs({
        'address': contract_address,
        'topics': [remove_event_signature],
        'fromBlock': 0,
        'toBlock': 'latest'
    })
    
    # Create a set of removed candidate IDs
    removed_candidates = set()
    for log in remove_logs:
        decoded_log = contract.events.CandidateRemoved().process_log(log)
        removed_candidates.add(decoded_log.args.id)
    
    # Process each add log
    for log in add_logs:
        # Decode the log
        decoded_log = contract.events.CandidateAdded().process_log(log)
        candidate_id = decoded_log.args.id
        
        # Skip if this candidate was removed
        if candidate_id in removed_candidates:
            continue
            
        try:
            candidate = contract.functions.candidates(candidate_id).call()
            # Additional check to ensure the candidate exists (id should be non-zero)
            if candidate[0] != 0:  # if id is not 0
                candidates.append({
                    "id": candidate[0],  # id
                    "name": candidate[1],  # name
                    "voteCount": candidate[2],  # voteCount
                    "imageCID": candidate[3]  # imageCID
                })
        except Exception as e:
            print(f"Error getting candidate {candidate_id}: {str(e)}")
            continue
            
    return candidates

def get_candidate_details(candidate_id: int):
    """Get details of a specific candidate"""
    try:
        candidate_details = contract.functions.getCandidateDetails(candidate_id).call()
        return {
            "id": candidate_details[0],
            "name": candidate_details[1],
            "voteCount": candidate_details[2],
            "imageCID": candidate_details[3]
        }
    except Exception as e:
        print(f"Error getting candidate details for {candidate_id}: {str(e)}")
        return None

def get_voter_details(voter_address: str):
    """Get details of a specific voter"""
    try:
        voter_details = contract.functions.getVoterDetails(Web3.to_checksum_address(voter_address)).call()
        return voter_details
    except Exception as e:
        print(f"Error getting voter details for {voter_address}: {str(e)}")
        raise e

def get_all_voters():
    """Get all voters from the contract"""
    addresses, is_registered, has_voted, vote_candidate_ids = contract.functions.getAllVotersDetails().call()
    return [{"address": addresses[i], "isRegistered": is_registered[i], "hasVoted": has_voted[i], "voteCandidateId": vote_candidate_ids[i]} for i in range(len(addresses))]

def get_voter_count():
    """Get the number of registered voters"""
    return contract.functions.getTotalRegisteredVoters().call()

def get_candidate_count():
    """Get the number of candidates"""
    return contract.functions.getCandidateCount().call()

def get_voting_period():
    """Get the current voting period status"""
    try:
        start_time = contract.functions.startTime().call()
        end_time = contract.functions.endTime().call()
        current_time = w3.eth.get_block('latest').timestamp
        
        return {
            "startTime": start_time,
            "endTime": end_time,
            "currentTime": current_time,
            "isSet": start_time != 0 and end_time != 0,
            "isActive": start_time != 0 and end_time != 0 and current_time >= start_time and current_time <= end_time,
            "hasEnded": start_time != 0 and end_time != 0 and current_time > end_time
        }
    except Exception as e:
        print(f"Error getting voting period: {str(e)}")
        return None


