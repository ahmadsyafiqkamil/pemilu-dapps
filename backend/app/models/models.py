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