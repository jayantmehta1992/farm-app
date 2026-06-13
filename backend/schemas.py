from pydantic import BaseModel


class Item(BaseModel):
    name: str
    description: str = ""


class Note(BaseModel):
    title: str
    content: str = ""
