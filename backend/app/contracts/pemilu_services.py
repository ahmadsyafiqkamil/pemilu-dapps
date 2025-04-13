import os 
import json
from web3 import Web3
from app.utils import utils

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ABI_PATH = os.path.join(BASE_DIR, 'abis', 'Pemilu.json')

with open(ABI_PATH, 'r') as f:
    abi = json.load(f)

w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL")))
if not w3.is_connected():
    raise Exception("Failed to connect to Ethereum node")


contract_address = os.getenv("CONTRACT_ADDRESS")
contract = w3.eth.contract(address=contract_address, abi=abi)

def get_all_candidates():
    candidate_count = contract.functions.candidateCount().call()
    candidates = []
    for i in range(candidate_count):
        candidate = contract.functions.candidates(i).call()
        candidates.append({
            "id": candidate[0],  # id
            "name": candidate[1],  # name
            "voteCount": candidate[2]  # voteCount
        })
    return candidates

def add_candidate(user_address: str, name: str):
    tx_function = contract.functions.addCandidate(name)
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