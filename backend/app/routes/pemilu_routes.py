from fastapi import APIRouter, HTTPException, Query
from app.contracts import pemilu_services
from app.models import models
from web3 import Web3

router = APIRouter()

# =============================================
# Utility Routes
# =============================================

@router.get("/")
def home():
    return {"message": "Hello World"}

# =============================================
# Admin Routes
# =============================================

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

@router.post("/admins/stop-voting-period")
def stop_voting_period(data: models.StopVotingPeriod):
    if not Web3.is_address(data.address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    try:
        tx = pemilu_services.stop_voting_period(user_address=data.address)
        return {"message": "Voting period stopped successfully", "tx_hash": tx}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admins/winner")
def get_winner(data: models.GetWinner):
    if not Web3.is_address(data.address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    try:
        winner = pemilu_services.get_winner(user_address=data.address)
        return {"winner": winner}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================
# Candidate Routes
# =============================================

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

@router.get("/candidates_count")
def get_candidate_count():
    return pemilu_services.get_candidate_count()

# =============================================
# Voter Routes
# =============================================

@router.get("/voters/check/{address}")
def check_voter(address: str):
    if not Web3.is_address(address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    try:
        # Get full voter details instead of just is_registered status
        voter_details = pemilu_services.get_voter_details(address)
        return {
            "is_registered": voter_details[0],
            "has_voted": voter_details[1],
            "vote_candidate_id": voter_details[2]
        }
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

@router.get("/voters/{voter_address}")
def get_voter_details(voter_address: str):
    if not Web3.is_address(voter_address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    try:
        voter_details = pemilu_services.get_voter_details(voter_address)
        return {
            "isRegistered": voter_details[0],
            "hasVoted": voter_details[1],
            "voteCandidateId": voter_details[2]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/voters/vote")
def vote(data: models.Vote):
    if not Web3.is_address(data.address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    try:
        # Get voting period status first
        voting_period = pemilu_services.get_voting_period()
        if not voting_period:
            raise HTTPException(status_code=500, detail="Failed to get voting period status")
            
        if not voting_period["isActive"]:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Voting period is not active",
                    "details": {
                        "currentTime": voting_period["currentTime"],
                        "startTime": voting_period["startTime"],
                        "endTime": voting_period["endTime"]
                    }
                }
            )
            
        # Proceed with voting
        tx = pemilu_services.vote(user_address=data.address, candidate_id=data.candidateId)
        return {"message": "Vote cast successfully", "tx_hash": tx}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error voting: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voters_count")
def get_voter_count():
    return pemilu_services.get_voter_count()

# =============================================
# Voting Period Routes
# =============================================

@router.post("/voters/set-voting-period")
def set_voting_period(data: models.SetVotingPeriod):
    if not Web3.is_address(data.address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")

    try:
        tx = pemilu_services.set_voting_period(user_address=data.address, start_time=data.startTime, end_time=data.endTime)
        return {"message": "Voting period set successfully", "tx_hash": tx}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/voting-period")
def get_voting_period():
    """Get the current voting period status"""
    try:
        period_status = pemilu_services.get_voting_period()
        if period_status is None:
            raise HTTPException(status_code=500, detail="Failed to get voting period status")
        return period_status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
