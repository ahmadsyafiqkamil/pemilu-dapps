from pydantic import BaseModel

class Candidate(BaseModel):
    name: str
    address: str

