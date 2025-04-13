from fastapi import APIRouter, HTTPException, Query
from app.contracts import pemilu_services
from app.models import models
from web3 import Web3
router = APIRouter()

@router.get("/")
def home():
    return {"message": "Hello World"}

@router.get("/candidates")
def get_candidates(address: str = Query(..., description="The address of the admin")):
    return pemilu_services.get_all_candidates()

@router.post("/candidates")
def add_candidate(data: models.Candidate):
    if not Web3.is_address(data.address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    try:
        tx = pemilu_services.add_candidate(user_address=data.address, name=data.name)
        return {"message": "Candidate added successfully", "tx_hash": tx}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))