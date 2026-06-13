from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from dependencies import get_db
from schemas import Note
from services import note_service

router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("")
async def create(note: Note, db: AsyncSession = Depends(get_db)):
    return await note_service.create_note(note, db)


@router.get("")
async def list_all(db: AsyncSession = Depends(get_db)):
    return await note_service.list_notes(db)


@router.put("/{note_id}")
async def update(note_id: int, note: Note, db: AsyncSession = Depends(get_db)):
    return await note_service.update_note(note_id, note, db)


@router.delete("/{note_id}")
async def delete(note_id: int, db: AsyncSession = Depends(get_db)):
    return await note_service.delete_note(note_id, db)
