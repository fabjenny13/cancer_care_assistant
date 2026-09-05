from pydantic import BaseModel, Field


class ProfileCreate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    age: int | None = Field(default=None, ge=0, le=150)
    cancer_type: str | None = Field(default=None, max_length=100)
    treatment_stage: str | None = Field(default=None, max_length=100)


class ProfileResponse(ProfileCreate):
    id: str
    user_id: str