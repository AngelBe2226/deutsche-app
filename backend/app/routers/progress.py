from fastapi import APIRouter
from pydantic import BaseModel

from .. import db

router = APIRouter(prefix="/api/progress", tags=["progress"])


class ValueIn(BaseModel):
    value: str


class ImportIn(BaseModel):
    items: dict[str, str]


@router.get("")
def get_progress() -> dict[str, str]:
    """All saved keys as a flat map, loaded once by the frontend."""
    return db.get_all()


@router.put("/{key}")
def set_progress(key: str, body: ValueIn):
    db.set_value(key, body.value)
    return {"ok": True, "key": key}


@router.delete("/{key}")
def delete_progress(key: str):
    db.delete(key)
    return {"ok": True, "key": key}


@router.post("/reset")
def reset_prefix(prefix: str):
    """Delete every key starting with `prefix` (e.g. 'b09-' to reset a block)."""
    deleted = db.delete_prefix(prefix)
    return {"ok": True, "deleted": deleted}


@router.post("/import")
def import_progress(body: ImportIn):
    """Bulk upsert — used to migrate existing localStorage from the old site."""
    count = db.set_many(body.items)
    return {"ok": True, "imported": count}
