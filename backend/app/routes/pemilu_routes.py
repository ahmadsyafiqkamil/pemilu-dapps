from fastapi import APIRouter, HTTPException, Query
from app.contracts import pemilu_services
from app.models import models
from web3 import Web3
router = APIRouter()

@router.get("/")
def home():
    return {"message": "Hello World"}

@router.get("/candidates")
def get_candidates():
    return pemilu_services.get_all_candidates()

@router.post("/candidates")
def add_candidate(data: models.Candidate):
    if not Web3.is_address(data.address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    try:
        # Verify if the address is an admin
        if not pemilu_services.is_admin(data.address):
            raise HTTPException(status_code=403, detail="Only admins can add candidates")
            
        tx = pemilu_services.add_candidate(user_address=data.address, name=data.name, imageCID=data.imageCID)
        return {"message": "Candidate added successfully", "tx_hash": tx}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/candidates/{candidate_id}")
def get_candidate_details(candidate_id: int):
    return pemilu_services.get_candidate_details(candidate_id)

@router.delete("/candidates/{candidate_id}")
def remove_candidate(data: models.RemoveCandidate):
    if not Web3.is_address(data.address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    try:
        # Verify if the address is an admin
        if not pemilu_services.is_admin(data.address):
            raise HTTPException(status_code=403, detail="Only admins can remove candidates")
        
        tx = pemilu_services.remove_candidate(user_address=data.address, candidate_id=data.candidateId)
        return {"message": "Candidate removed successfully", "tx_hash": tx}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/admins")
def add_admin(owner_address: str = Query(..., description="Contract owner address"), 
              new_admin_address: str = Query(..., description="New admin address")):
    if not Web3.is_address(owner_address) or not Web3.is_address(new_admin_address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    try:
        tx = pemilu_services.add_admin(owner_address=owner_address, new_admin_address=new_admin_address)
        return {"message": "Admin added successfully", "tx_hash": tx}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/admins/{admin_address}")
def remove_admin(admin_address: str, 
                owner_address: str = Query(..., description="Contract owner address")):
    if not Web3.is_address(owner_address) or not Web3.is_address(admin_address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    try:
        tx = pemilu_services.remove_admin(owner_address=owner_address, admin_address=admin_address)
        return {"message": "Admin removed successfully", "tx_hash": tx}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admins/check/{address}")
def check_admin(address: str):
    if not Web3.is_address(address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    try:
        is_admin = pemilu_services.is_admin(address)
        return {"is_admin": is_admin}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voters/check/{address}")
def check_voter(address: str):
    if not Web3.is_address(address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    try:
        is_registered = pemilu_services.is_voter(address)
        return {"is_registered": is_registered}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/voters/register")
def register_voter(address: str = Query(..., description="Voter address")):
    if not Web3.is_address(address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    try:
        tx = pemilu_services.register_voter(address)
        return {"message": "Voter registered successfully", "tx_hash": tx}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/voters/{voter_address}")
def remove_voter(data: models.RemoveVoter):
    if not Web3.is_address(data.address) or not Web3.is_address(data.voterAddress):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    try:
        tx = pemilu_services.remove_voter(user_address=data.address, voter_address=data.voterAddress)
        return {"message": "Voter removed successfully", "tx_hash": tx}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/voters")
def get_all_voters():
    return pemilu_services.get_all_voters()

@router.post("/voters/vote")
def vote(data: models.Vote):
    if not Web3.is_address(data.address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    try:
        tx = pemilu_services.vote(user_address=data.address, candidate_id=data.candidateId)
        return {"message": "Vote cast successfully", "tx_hash": tx}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voters/count")
def get_voter_count():
    return pemilu_services.get_voter_count()

