from bson import ObjectId
from fastapi import HTTPException

from database import item_collection
from schemas import Item


async def create_item(item: Item) -> dict:
    result = await item_collection.insert_one(item.model_dump())
    return {"id": str(result.inserted_id), "name": item.name}


async def list_items() -> list[dict]:
    items = []
    async for doc in item_collection.find():
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items


async def update_item(item_id: str, item: Item) -> dict:
    result = await item_collection.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": item.model_dump()},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"id": item_id, "name": item.name}


async def delete_item(item_id: str) -> dict:
    result = await item_collection.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"deleted": item_id}
