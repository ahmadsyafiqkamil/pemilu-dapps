from pydantic import BaseModel

class Candidate(BaseModel):
    name: str
    address: str
    imageCID: str

class CandidateDetails(BaseModel):
    id: int
    name: str
    voteCount: int
    imageCID: str

class RemoveCandidate(BaseModel):
    address: str
    candidateId: int

class RemoveVoter(BaseModel):
    address: str
    voterAddress: str

class Vote(BaseModel):
    address: str
    candidateId: int

class SetVotingPeriod(BaseModel):
    address: str
    startTime: int
    endTime: int

class GetWinner(BaseModel):
    address: str

class StopVotingPeriod(BaseModel):
    address: str
