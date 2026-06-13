from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database_sqlite import NoteModel
from schemas import Note


async def create_note(note: Note, db: AsyncSession) -> dict:
    db_note = NoteModel(title=note.title, content=note.content)
    db.add(db_note)
    await db.commit()
    await db.refresh(db_note)
    return {"id": db_note.id, "title": db_note.title}


async def list_notes(db: AsyncSession) -> list[dict]:
    result = await db.execute(select(NoteModel))
    notes = result.scalars().all()
    return [{"id": n.id, "title": n.title, "content": n.content} for n in notes]


async def update_note(note_id: int, note: Note, db: AsyncSession) -> dict:
    result = await db.execute(select(NoteModel).where(NoteModel.id == note_id))
    db_note = result.scalar_one_or_none()
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    db_note.title = note.title
    db_note.content = note.content
    await db.commit()
    await db.refresh(db_note)
    return {"id": db_note.id, "title": db_note.title}


async def delete_note(note_id: int, db: AsyncSession) -> dict:
    result = await db.execute(select(NoteModel).where(NoteModel.id == note_id))
    db_note = result.scalar_one_or_none()
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    await db.delete(db_note)
    await db.commit()
    return {"deleted": note_id}
