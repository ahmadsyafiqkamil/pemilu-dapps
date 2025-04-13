import os
from dotenv import load_dotenv

load_dotenv()

RPC_URL = os.getenv("RPC_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
# CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS_SEPOLIA")
CONTRACT_ADDRESS = '0x296a5aa5f4ee8D9a764123dEA24e665FF57f411A'