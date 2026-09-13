from fastapi import APIRouter, HTTPException

from .. import content

router = APIRouter(prefix="/api", tags=["content"])


@router.get("/blocks")
def list_blocks():
    """Sidebar index: the 15 blocks with title and section count."""
    return content.get_index()


@router.get("/blocks/{block}")
def get_block(block: str):
    """Full content for one block (block is zero-padded, e.g. '01')."""
    data = content.get_block(block)
    if data is None:
        raise HTTPException(status_code=404, detail=f"block {block} not found")
    return data
