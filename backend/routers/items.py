from fastapi import APIRouter

from schemas import Item
from services import item_service

router = APIRouter(prefix="/items", tags=["items"])


@router.post("")
async def create(item: Item):
    return await item_service.create_item(item)


@router.get("")
async def list_all():
    return await item_service.list_items()


@router.put("/{item_id}")
async def update(item_id: str, item: Item):
    return await item_service.update_item(item_id, item)


@router.delete("/{item_id}")
async def delete(item_id: str):
    return await item_service.delete_item(item_id)
