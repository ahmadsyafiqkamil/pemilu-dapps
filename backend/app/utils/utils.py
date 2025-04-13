from web3 import Web3
from app.config import RPC_URL

w3 = Web3(Web3.HTTPProvider("https://sepolia.infura.io/v3/003407eef50141a2af1c6b8b39ec0b2c"))


def get_gas_parameters(tx_function, sender_address, extra_gas=50000, extra_gwei=2):
    """
    Menghitung gas limit dan parameter EIP-1559 (type 2) seperti maxFeePerGas dan maxPriorityFeePerGas.

    Parameters:
    - tx_function: Fungsi transaksi dari smart contract (contoh: contract.functions.addTask(...))
    - sender_address: Alamat pengirim transaksi
    - extra_gas: Buffer tambahan gas (default: 50.000)
    - extra_gwei: Buffer tip (priority fee) dalam Gwei

    Returns:
    - gas_limit: int
    - gas_params: dict {maxFeePerGas, maxPriorityFeePerGas, type, chainId}
    """
    try:
        # Estimasi gas limit
        estimated_gas = tx_function.estimate_gas({"from": sender_address})
        gas_limit = estimated_gas + extra_gas

        # Ambil base fee dari blok terakhir
        fee_history = w3.eth.fee_history(1, "latest")
        base_fee = fee_history["baseFeePerGas"][-1]

        # Tambahkan tip (priority fee) agar cepat masuk blok
        max_priority_fee = w3.to_wei(extra_gwei, "gwei")
        max_fee = base_fee + max_priority_fee

        gas_params = {
            "maxFeePerGas": max_fee,
            "maxPriorityFeePerGas": max_priority_fee,
            "type": 2,
            "chainId": w3.eth.chain_id,
        }

        print(f"[GAS] Limit: {gas_limit}, MaxFeePerGas: {w3.from_wei(max_fee, 'gwei')} Gwei, Priority: {extra_gwei} Gwei")
        return gas_limit, gas_params

    except Exception as e:
        raise Exception(f"Error mendapatkan parameter gas EIP-1559: {str(e)}")



def check_balance(address):
    """
    Mengecek saldo ETH dari alamat yang diberikan.

    Parameters:
    - address: Alamat Ethereum yang akan diperiksa saldonya.

    Returns:
    - balance_eth: Saldo ETH dalam satuan Ether.
    """

    try:
        balance_wei = w3.eth.get_balance(address)  # Dapatkan saldo dalam Wei
        balance_eth = w3.from_wei(balance_wei, "ether")  # Konversi ke ETH

        print(f"Saldo {address}: {balance_eth} ETH")

        return balance_eth

    except Exception as e:
        raise Exception(f"Error mendapatkan saldo: {str(e)}")