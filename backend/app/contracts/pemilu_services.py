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

def is_contract_owner(address: str) -> bool:
    """Check if the given address is the contract owner"""
    owner = contract.functions.owner().call()
    return Web3.to_checksum_address(address) == Web3.to_checksum_address(owner)

def is_admin(address: str) -> bool:
    """Check if the given address is an admin"""
    return contract.functions.isAdmin(Web3.to_checksum_address(address)).call()

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

def get_all_candidates():
    """Get all candidates from the contract"""
    candidate_count = contract.functions.candidateCount().call()
    candidates = []
    
    # Get the event signature and ensure it has 0x prefix
    event_signature = "0x" + w3.keccak(text="CandidateAdded(uint256,string,string)").hex().lstrip("0x")
    
    # Get logs for candidate additions
    logs = w3.eth.get_logs({
        'address': contract_address,
        'topics': [event_signature],
        'fromBlock': 0,
        'toBlock': 'latest'
    })
    
    # Process each log
    for log in logs:
        # Decode the log
        decoded_log = contract.events.CandidateAdded().process_log(log)
        candidate_id = decoded_log['args']['id']
        try:
            candidate = contract.functions.candidates(candidate_id).call()
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

def add_candidate(user_address: str, name: str, imageCID: str):
    if not is_admin(user_address):
        raise Exception("Only admins can add candidates")
        
    tx_function = contract.functions.addCandidate(name, imageCID)
    return build_transact(tx_function, user_address)

def build_transact(tx_function, user_address):
    gas_limit, gas_params = utils.get_gas_parameters(tx_function, user_address)
    nonce = w3.eth.get_transaction_count(user_address)

    tx = tx_function.build_transaction({
    "from": user_address,
    "nonce": nonce,
    "gas": gas_limit,
    **gas_params
})

    # 💡 Convert BigNumber/Hex to int before returning as JSON
    tx["gas"] = int(tx["gas"])
    tx["nonce"] = int(tx["nonce"])
    tx["maxFeePerGas"] = int(tx["maxFeePerGas"])
    tx["maxPriorityFeePerGas"] = int(tx["maxPriorityFeePerGas"])
    tx["chainId"] = int(tx["chainId"])
    tx["value"] = int(tx.get("value", 0))  # just in case

    return tx



# add new admin: cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 "addAdmin(address)" 0xA85E11ed0Cb976B18Ba7F4D10180b635Fe24DEc0 --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80