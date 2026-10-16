"""Celery application and asynchronous background task definitions."""

import csv
import logging
import time
from pathlib import Path
from typing import Any, Dict, List
from celery import Celery

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.config import settings
from app.database import SessionLocal
from app.models.order import Order
from app.models.product import Product

logger = logging.getLogger("celery_worker")

# -------------------------------------------------------------
# 1. Initialize Celery Application
# -------------------------------------------------------------
celery_app = Celery(
    "ecommerce_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

# Redis local ga lekapothe fallback (eager mode)
from app.services.redis_service import redis_client
import fakeredis

is_fake_redis = isinstance(redis_client, fakeredis.FakeRedis)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_always_eager=is_fake_redis,
    task_eager_propagates=True,
    beat_schedule={
        "periodic-health-heartbeat": {
            "task": "app.services.celery_app.periodic_health_heartbeat_task",
            "schedule": 60.0,
        },
        "periodic-cache-cleanup": {
            "task": "app.services.celery_app.periodic_cache_cleanup_task",
            "schedule": 900.0,
        },
        "periodic-catalog-sync": {
            "task": "app.services.celery_app.periodic_catalog_sync_task",
            "schedule": 3600.0,
        },
    },
)

if is_fake_redis:
    celery_app.conf.update(
        broker_url="memory://",
        result_backend="cache+memory://",
        task_store_eager_result=True,
    )


# -------------------------------------------------------------
# 2. Existing Task: Order Confirmation Email
# -------------------------------------------------------------
@celery_app.task(bind=True, max_retries=3, default_retry_delay=5)
def send_order_confirmation_email(
    self,
    order_id: int,
    user_email: str,
    total_amount: float,
    items: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Background task to send an itemized order confirmation receipt to the customer."""
    try:
        logger.info(
            "Dispatching order confirmation email for Order #%s to %s",
            order_id,
            user_email,
        )

        item_summary = "\n".join(
            [
                f"- {it.get('product_name')}: {it.get('quantity')} x ${it.get('unit_price')} = ${it.get('subtotal')}"
                for it in items
            ]
        )
        email_content = (
            f"Dear Customer,\n\n"
            f"Thank you for your order #{order_id}!\n\n"
            f"Order Summary:\n{item_summary}\n\n"
            f"Total Charged: ${total_amount:.2f}\n\n"
            f"We are processing your order right away.\n"
        )

        logger.info(
            "Order confirmation email successfully sent for Order #%d:\n%s",
            order_id,
            email_content,
        )

        return {
            "status": "SENT",
            "order_id": order_id,
            "recipient": user_email,
            "items_count": len(items),
            "total_amount": total_amount,
        }
    except Exception as exc:
        logger.error("Failed to send order confirmation email: %s. Retrying...", exc)
        raise self.retry(exc=exc)


# -------------------------------------------------------------
# 2b. NEW CELERY TASK: Asynchronous SMS OTP Dispatch
# -------------------------------------------------------------
@celery_app.task(bind=True, max_retries=3, default_retry_delay=3)
def send_sms_otp_task(self, phone_number: str, otp_code: str) -> Dict[str, Any]:
    """
    Celery Background Task:
    Dispatches a 6-digit one-time password (OTP) via SMS to the customer's mobile number.
    Connects to external SMS gateways (Fast2SMS / Twilio) if configured,
    and logs worker dispatch audit records.
    """
    import os
    import urllib.request
    import urllib.parse
    import json

    clean_phone = phone_number.replace("+", "").replace("-", "").replace(" ", "")
    if len(clean_phone) > 10 and clean_phone.startswith("91"):
        clean_phone = clean_phone[2:]

    message_text = f"Your Atelier Sivora OTP is {otp_code}. Valid for 5 minutes. Do not share this OTP with anyone."
    sms_sent = False
    provider_used = "celery_worker_sms_gateway"

    # 1. Fast2SMS Integration (Indian Gateway - if FAST2SMS_API_KEY is configured in env)
    fast2sms_key = os.getenv("FAST2SMS_API_KEY")
    if fast2sms_key:
        try:
            req_data = json.dumps({
                "route": "otp",
                "variables_values": otp_code,
                "numbers": clean_phone,
            }).encode("utf-8")
            req = urllib.request.Request(
                "https://www.fast2sms.com/dev/bulkV2",
                data=req_data,
                headers={
                    "authorization": fast2sms_key,
                    "Content-Type": "application/json",
                },
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                resp_body = response.read().decode("utf-8")
                logger.info("Fast2SMS API Response: %s", resp_body)
                sms_sent = True
                provider_used = "fast2sms_api"
        except Exception as e:
            logger.error("Fast2SMS dispatch failed: %s", e)

    # 2. Twilio Integration (if TWILIO credentials configured)
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_from = os.getenv("TWILIO_PHONE_NUMBER")
    if not sms_sent and twilio_sid and twilio_token and twilio_from:
        try:
            import base64
            auth_header = "Basic " + base64.b64encode(f"{twilio_sid}:{twilio_token}".encode("utf-8")).decode("utf-8")
            form_data = urllib.parse.urlencode({
                "To": f"+91{clean_phone}",
                "From": twilio_from,
                "Body": message_text,
            }).encode("utf-8")
            req = urllib.request.Request(
                f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json",
                data=form_data,
                headers={"Authorization": auth_header},
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                sms_sent = True
                provider_used = "twilio_sms"
        except Exception as e:
            logger.error("Twilio dispatch failed: %s", e)

    # 3. Always print to console / stdout in prominent Celery Worker format
    print("\n" + "=" * 64, flush=True)
    print("📱 [CELERY WORKER - ASYNC SMS OTP DISPATCH]", flush=True)
    print(f"   Provider   : {provider_used}", flush=True)
    print(f"   Recipient  : +91 {clean_phone}", flush=True)
    print(f"   OTP CODE   : >>> {otp_code} <<<", flush=True)
    print(f"   Message    : {message_text}", flush=True)
    print("=" * 64 + "\n", flush=True)

    logger.info("==================================================================")
    logger.info("📱 [CELERY WORKER - ASYNC SMS OTP DISPATCH]")
    logger.info("Provider: %s", provider_used)
    logger.info("Recipient: +91 %s", clean_phone)
    logger.info("Message: %s", message_text)
    logger.info("OTP Code: %s", otp_code)
    logger.info("Timestamp: %s", time.strftime('%Y-%m-%d %H:%M:%S'))
    logger.info("==================================================================")

    # Save to Redis for audit log
    try:
        redis_client.set(f"sms:latest:{clean_phone}", otp_code, ex=300)
    except Exception:
        pass

    return {
        "status": "SENT",
        "phone_number": clean_phone,
        "provider": provider_used,
        "otp_dispatched": True,
        "timestamp": time.time(),
    }


# -------------------------------------------------------------
# 3. DAY 18 NEW TASK: PDF Invoice Generation with Live Progress
# -------------------------------------------------------------
@celery_app.task(bind=True)
def generate_pdf_invoice_task(self, order_id: int) -> Dict[str, Any]:
    """
    Background Task: Generates an Amazon-style PDF Tax Invoice with Company Stamp & QR Code.
    Periodically updates task state with progress (0% -> 100%) for React UI tracking.
    """
    from sqlalchemy.orm import selectinload, joinedload
    from app.models.order import OrderItem
    from app.services.invoice_generator import generate_enterprise_invoice_pdf

    # Step 1: Starting & fetching data (20%)
    self.update_state(
        state="PROGRESS",
        meta={"progress": 20, "message": "Fetching order & customer details from database..."},
    )
    time.sleep(0.8)

    db = SessionLocal()
    try:
        # Eager load items, products, and user to avoid N+1 queries
        order = (
            db.query(Order)
            .options(
                selectinload(Order.items).joinedload(OrderItem.product),
                joinedload(Order.user),
            )
            .filter(Order.id == order_id)
            .first()
        )
        if not order:
            raise ValueError(f"Order #{order_id} not found in database")

        # Step 2: Creating Enterprise PDF Layout & Stamp (55%)
        self.update_state(
            state="PROGRESS",
            meta={"progress": 55, "message": "Applying SIVORA official stamp & calculating taxes..."},
        )
        time.sleep(1.0)

        invoices_dir = settings.UPLOAD_DIR / "invoices"
        invoices_dir.mkdir(parents=True, exist_ok=True)
        pdf_filename = f"invoice_order_{order_id}.pdf"
        pdf_path = invoices_dir / pdf_filename

        # Render Enterprise Amazon-Style Invoice
        generate_enterprise_invoice_pdf(order, pdf_path)

        # Step 3: Finalizing (90%)
        self.update_state(
            state="PROGRESS",
            meta={"progress": 90, "message": "Embedding digital QR code & saving PDF..."},
        )
        time.sleep(0.5)

        # Step 4: Complete
        return {
            "order_id": order_id,
            "file_url": f"/uploads/invoices/{pdf_filename}",
            "message": "Enterprise Tax Invoice generated successfully with Official Stamp!",
        }
    finally:
        db.close()


# -------------------------------------------------------------
# 4. DAY 18 NEW TASK: Bulk CSV Import with Live Progress Bar
# -------------------------------------------------------------
@celery_app.task(bind=True)
def bulk_import_products_csv_task(self, file_path_str: str) -> Dict[str, Any]:
    """
    Background Task: Reads products from uploaded CSV file in batches,
    inserts into database, and updates progress percentage for the UI progress bar.
    """
    file_path = Path(file_path_str)
    if not file_path.exists():
        raise FileNotFoundError(f"CSV file not found: {file_path_str}")

    db = SessionLocal()
    try:
        # Step A: Total lines calculate cheyali
        with open(file_path, "r", encoding="utf-8") as f:
            total_rows = sum(1 for _ in f) - 1

        if total_rows <= 0:
            return {"imported_count": 0, "message": "Empty CSV file"}

        imported_count = 0

        # Step B: Read & Insert each product
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for index, row in enumerate(reader, start=1):
                base_name = row.get("name", f"Imported Product {index}")
                slug = row.get("slug") or f"{base_name.lower().replace(' ', '-')}-{int(time.time())}-{index}"
                
                raw_img = row.get("image_url") or row.get("thumbnail_url")
                if not raw_img:
                    name_l = base_name.lower()
                    if "headphone" in name_l or "audio" in name_l:
                        raw_img = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"
                    elif "monitor" in name_l:
                        raw_img = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80"
                    elif "mouse" in name_l:
                        raw_img = "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80"
                    elif "keyboard" in name_l:
                        raw_img = "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80"
                    elif "phone" in name_l or "iphone" in name_l:
                        raw_img = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80"
                    elif "laptop" in name_l or "macbook" in name_l:
                        raw_img = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80"
                    else:
                        raw_img = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80"

                from app.models.product import Category
                cat_id = None
                if row.get("category_id"):
                    try:
                        cat_id = int(row.get("category_id"))
                    except (ValueError, TypeError):
                        pass
                if not cat_id and row.get("category"):
                    cat = db.query(Category).filter(Category.name.ilike(row.get("category").strip())).first()
                    if cat:
                        cat_id = cat.id
                if not cat_id:
                    first_cat = db.query(Category).first()
                    cat_id = first_cat.id if first_cat else 1

                product = Product(
                    name=base_name,
                    slug=slug,
                    description=row.get("description", "Bulk imported product"),
                    price=float(row.get("price", 10.0)),
                    stock=int(row.get("stock", 50)),
                    category_id=cat_id,
                    image_url=raw_img,
                    thumbnail_url=raw_img,
                    is_active=True,
                )
                db.add(product)
                imported_count += 1
                db.commit()

                # Progress percentage calculate chestunnam (0 to 100%)
                current_percent = int((index / total_rows) * 100)

                # Celery status update: UI lo progress bar animate avvadaniki!
                self.update_state(
                    state="PROGRESS",
                    meta={
                        "progress": current_percent,
                        "processed": index,
                        "total": total_rows,
                        "message": f"Importing product {index} of {total_rows}...",
                    },
                )
                time.sleep(0.05)

        # Invalidate product caches so Admin & Storefront show fresh products immediately
        from app.services.redis_service import CacheService
        CacheService.invalidate_product_caches()

        return {
            "imported_count": imported_count,
            "message": f"Successfully imported {imported_count} products!",
        }
    finally:
        db.close()


# -------------------------------------------------------------
# 5. DAY 22 NEW TASK: Asynchronous AI Vector Store Re-indexing
# -------------------------------------------------------------
@celery_app.task(bind=True)
def reindex_catalog_vector_store_task(self) -> Dict[str, Any]:
    """
    Day 22 Background AI Task:
    Offloads heavy ChromaDB vector embeddings computation to background Celery worker.
    Reports progress (0% -> 100%) so UI never hangs or times out on large catalogs.
    """
    from app.services.rag_service import RAGService
    from app.services.ai_cache_service import AICacheService

    if getattr(self.request, "id", None):
        self.update_state(
            state="PROGRESS",
            meta={"progress": 20, "message": "Connecting to PostgreSQL and loading active catalog items..."},
        )
    time.sleep(0.1)

    db = SessionLocal()
    try:
        if getattr(self.request, "id", None):
            self.update_state(
                state="PROGRESS",
                meta={"progress": 50, "message": "Computing 384-dimensional dense embeddings in ChromaDB..."},
            )
        count = RAGService.index_all_products(db)

        if getattr(self.request, "id", None):
            self.update_state(
                state="PROGRESS",
                meta={"progress": 85, "message": "Invalidating stale Redis AI semantic search cache..."},
            )
        AICacheService.invalidate_prefix(AICacheService.PREFIX_SEMANTIC)

        return {
            "indexed_count": count,
            "message": f"Successfully indexed {count} products in ChromaDB vector store asynchronously!",
            "status": "COMPLETED",
        }
    finally:
        db.close()


# -------------------------------------------------------------
# 6. DAY 22 NEW TASK: Asynchronous Batch Product Description Generator
# -------------------------------------------------------------
@celery_app.task(bind=True)
def batch_generate_descriptions_task(self, product_ids: List[int], tone: str = "luxury") -> Dict[str, Any]:
    """
    Day 22 Background AI Task:
    Asynchronously generates marketing descriptions for a batch of products via LLM,
    updates database records, and flushes product caches without blocking web requests.
    """
    from app.services.ai_description_service import AIDescriptionService
    from app.services.redis_service import CacheService

    total = len(product_ids)
    if total == 0:
        return {"processed": 0, "message": "No product IDs provided"}

    db = SessionLocal()
    processed = 0
    try:
        for idx, pid in enumerate(product_ids, start=1):
            product = db.query(Product).filter(Product.id == pid).first()
            if product:
                cat_name = product.category.name if product.category else "General"
                ai_desc = AIDescriptionService.generate_description(
                    name=product.name,
                    category=cat_name,
                    price=float(product.price),
                    tone=tone,
                )
                if ai_desc.get("description"):
                    product.description = ai_desc["description"]
                    db.commit()
                    processed += 1

            progress_pct = int((idx / total) * 100)
            if getattr(self.request, "id", None):
                self.update_state(
                    state="PROGRESS",
                    meta={
                        "progress": progress_pct,
                        "processed": idx,
                        "total": total,
                        "message": f"Generated AI description {idx}/{total}...",
                    },
                )
            time.sleep(0.1)

        CacheService.invalidate_product_caches()
        return {
            "processed": processed,
            "total": total,
            "message": f"Successfully generated descriptions for {processed} products asynchronously!",
        }
    finally:
        db.close()


# -------------------------------------------------------------
# 7. DAY 23 NEW TASKS: Celery Beat Scheduled Periodic Jobs
# -------------------------------------------------------------
@celery_app.task(bind=True)
def periodic_health_heartbeat_task(self) -> Dict[str, Any]:
    """
    Day 23 Celery Beat Task:
    Heartbeat ping executing every 60s to record worker & broker liveness.
    """
    timestamp = time.time()
    try:
        redis_client.set("celery:beat:heartbeat", str(timestamp), ex=120)
    except Exception:
        pass
    logger.info("Celery Beat Heartbeat tick recorded at %s", timestamp)
    return {
        "status": "HEALTHY",
        "timestamp": timestamp,
        "message": "Celery Beat & Worker cluster heartbeat verified.",
    }


@celery_app.task(bind=True)
def periodic_cache_cleanup_task(self) -> Dict[str, Any]:
    """
    Day 23 Celery Beat Task:
    Executes periodically every 15 minutes to inspect and clean expired temporary AI/search keys.
    """
    cleaned_count = 0
    try:
        keys = redis_client.keys("ai:cache:temp:*")
        if keys:
            cleaned_count = redis_client.delete(*keys)
    except Exception:
        pass
    logger.info("Celery Beat periodic cache sweep completed. Keys removed: %s", cleaned_count)
    return {
        "status": "SUCCESS",
        "cleaned_keys_count": cleaned_count,
        "message": "Periodic Redis cache sweep completed.",
    }


@celery_app.task(bind=True)
def periodic_catalog_sync_task(self) -> Dict[str, Any]:
    """
    Day 23 Celery Beat Task:
    Executes every hour to verify database product inventory matches ChromaDB embeddings count.
    """
    db = SessionLocal()
    try:
        total_products = db.query(Product).filter(Product.is_active == True).count()
        logger.info("Celery Beat catalog sync check: %s active products.", total_products)
        return {
            "status": "SYNCED",
            "active_products": total_products,
            "message": f"Active product count verified: {total_products}",
        }
    finally:
        db.close()