# -*- coding: utf-8 -*-
"""
SIVORA -- Pure Catalog Wipe (No new products or categories added)
"""
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import SessionLocal
from app.models import Category, Product, Order, OrderItem, ChatMessage

try:
    from app.services.rag_service import RAGService
    HAS_RAG = True
except Exception:
    HAS_RAG = False

try:
    from app.services.ai_cache_service import AICacheService
    HAS_CACHE = True
except Exception:
    HAS_CACHE = False


def wipe():
    db = SessionLocal()
    try:
        print("Clearing database records...")
        deleted_chats = db.query(ChatMessage).delete()
        deleted_order_items = db.query(OrderItem).delete()
        deleted_orders = db.query(Order).delete()
        deleted_products = db.query(Product).delete()
        deleted_categories = db.query(Category).delete()
        db.commit()

        print(f"Deleted {deleted_chats} chat messages.")
        print(f"Deleted {deleted_order_items} order items.")
        print(f"Deleted {deleted_orders} orders.")
        print(f"Deleted {deleted_products} products.")
        print(f"Deleted {deleted_categories} categories.")

        if HAS_CACHE:
            try:
                cache = AICacheService()
                cache.clear_all()
                print("Redis AI cache cleared.")
            except Exception as e:
                print(f"Redis cache skip: {e}")

        if HAS_RAG:
            try:
                rag = RAGService()
                rag.clear_collection()
                print("ChromaDB vector store cleared.")
            except Exception as e:
                print(f"ChromaDB clear skip: {e}")

        print("Catalog wipe finished successfully! (0 products, 0 categories)")
    finally:
        db.close()


if __name__ == "__main__":
    wipe()
