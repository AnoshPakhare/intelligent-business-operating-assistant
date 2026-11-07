from datetime import date
from decimal import Decimal
from fastapi import FastAPI, HTTPException, Response
from psycopg.rows import dict_row

from app.database import get_connection
from app.pdf_generator import generate_invoice_pdf
from app.schemas import (
    CustomerCreate,
    ItemCreate,
    ItemResponse,
    InventoryUpdate,
    InventoryResponse,
    InvoiceCreate,
    InvoiceResponse,
    InvoiceDetailResponse,
    ExpenseCreate,
    ExpenseResponse,
)
from app.ai.schemas import AIChatRequest, AIChatResponse
from app.ai.agent import process_chat_request

app = FastAPI(title="Intelligent Business Operating Assistant")


@app.get("/")
def root():
    return {
        "message": "IBOA Backend is running"
    }


@app.get("/health")
def health_check():
    try:
        connection = get_connection()
        connection.close()

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }


@app.get("/customers")
def get_customers():
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("SELECT * FROM customers ORDER BY customer_id ASC")
            customers = cursor.fetchall()

        return customers

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if connection:
            connection.close()


@app.post("/customers")
def create_customer(customer: CustomerCreate):
    connection = None

    try:
        connection = get_connection()

        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO customers
                (customer_type, name, phone, email, address, gstin)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING customer_id
                """,
                (
                    customer.customer_type,
                    customer.name,
                    customer.phone,
                    customer.email,
                    customer.address,
                    customer.gstin,
                ),
            )

            customer_id = cursor.fetchone()[0]

        connection.commit()

        return {
            "message": "Customer created successfully",
            "customer_id": customer_id
        }

    except Exception as e:
        if connection:
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if connection:
            connection.close()


@app.get("/items", response_model=list[ItemResponse])
def get_items():
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("SELECT * FROM items ORDER BY item_id ASC")
            items = cursor.fetchall()

        return items

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if connection:
            connection.close()


@app.post("/items")
def create_item(item: ItemCreate):
    if item.type not in ["PRODUCT", "SERVICE"]:
        raise HTTPException(
            status_code=400,
            detail="Type must be either PRODUCT or SERVICE"
        )

    connection = None

    try:
        connection = get_connection()

        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO items
                (name, type, description, price, unit, gst_applicable, gst_rate)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING item_id
                """,
                (
                    item.name,
                    item.type,
                    item.description,
                    item.price,
                    item.unit,
                    item.gst_applicable,
                    item.gst_rate,
                ),
            )

            item_id = cursor.fetchone()[0]

        connection.commit()

        return {
            "message": "Item created successfully",
            "item_id": item_id
        }

    except HTTPException:
        if connection:
            connection.rollback()
        raise

    except Exception as e:
        if connection:
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if connection:
            connection.close()


@app.get("/inventory", response_model=list[InventoryResponse])
def get_inventory():
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                SELECT
                    i.inventory_id,
                    i.item_id,
                    it.name AS item_name,
                    i.quantity,
                    i.reorder_level,
                    i.updated_at
                FROM inventory i
                JOIN items it ON i.item_id = it.item_id
                WHERE it.type = 'PRODUCT'
                ORDER BY i.inventory_id ASC
                """
            )
            inventory_records = cursor.fetchall()

        return inventory_records

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if connection:
            connection.close()


@app.get("/inventory/low-stock", response_model=list[InventoryResponse])
def get_low_stock_inventory():
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                SELECT
                    i.inventory_id,
                    i.item_id,
                    it.name AS item_name,
                    i.quantity,
                    i.reorder_level,
                    i.updated_at
                FROM inventory i
                JOIN items it ON i.item_id = it.item_id
                WHERE it.type = 'PRODUCT' AND i.quantity <= i.reorder_level
                ORDER BY i.inventory_id ASC
                """
            )
            low_stock_records = cursor.fetchall()

        return low_stock_records

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if connection:
            connection.close()


@app.put("/inventory/{item_id}")
def update_inventory(item_id: int, inventory: InventoryUpdate):
    if inventory.quantity < 0 or inventory.reorder_level < 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity and reorder level must be greater than or equal to 0"
        )

    connection = None

    try:
        connection = get_connection()

        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                "SELECT item_id, name, type FROM items WHERE item_id = %s",
                (item_id,)
            )
            item = cursor.fetchone()

            if not item:
                raise HTTPException(
                    status_code=404,
                    detail="Item not found"
                )

            if item["type"] != "PRODUCT":
                raise HTTPException(
                    status_code=400,
                    detail="Services cannot have inventory. Inventory can only be updated for products."
                )

            cursor.execute(
                """
                INSERT INTO inventory (item_id, quantity, reorder_level, updated_at)
                VALUES (%s, %s, %s, NOW())
                ON CONFLICT (item_id) DO UPDATE
                SET quantity = EXCLUDED.quantity,
                    reorder_level = EXCLUDED.reorder_level,
                    updated_at = NOW()
                RETURNING inventory_id
                """,
                (item_id, inventory.quantity, inventory.reorder_level),
            )

            inventory_id = cursor.fetchone()["inventory_id"]

        connection.commit()

        return {
            "message": "Inventory updated successfully",
            "inventory_id": inventory_id,
            "item_id": item_id,
            "quantity": inventory.quantity,
            "reorder_level": inventory.reorder_level
        }

    except HTTPException:
        if connection:
            connection.rollback()
        raise

    except Exception as e:
        if connection:
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if connection:
            connection.close()


@app.post("/invoices")
def create_invoice(payload: InvoiceCreate):
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(row_factory=dict_row) as cursor:
            # 1. Verify customer exists
            cursor.execute(
                "SELECT customer_id FROM customers WHERE customer_id = %s",
                (payload.customer_id,)
            )
            customer = cursor.fetchone()
            if not customer:
                raise HTTPException(
                    status_code=404,
                    detail=f"Customer with ID {payload.customer_id} not found"
                )

            # 2. Get business prefix
            cursor.execute("SELECT invoice_prefix FROM business LIMIT 1")
            business = cursor.fetchone()
            prefix = business["invoice_prefix"] if business and business.get("invoice_prefix") else "INV"

            # 3. Determine continuous next invoice sequence number
            cursor.execute("SELECT MAX(invoice_id) AS max_id FROM invoices")
            res = cursor.fetchone()
            max_id = res["max_id"] if res and res["max_id"] is not None else 0
            next_seq = max_id + 1

            # 4. Financial year calculation
            today = date.today()
            if today.month >= 4:
                fy = f"{today.year}-{str(today.year + 1)[-2:]}"
            else:
                fy = f"{today.year - 1}-{str(today.year)[-2:]}"

            invoice_number = f"{prefix}/{next_seq}/{fy}"

            # 5. Fetch items & aggregate requested quantities per item_id
            item_quantities = {}
            for line in payload.items:
                item_quantities[line.item_id] = item_quantities.get(line.item_id, Decimal("0")) + Decimal(str(line.quantity))

            items_map = {}
            for item_id in item_quantities.keys():
                cursor.execute(
                    "SELECT item_id, name, type, price, gst_applicable, gst_rate FROM items WHERE item_id = %s",
                    (item_id,)
                )
                it = cursor.fetchone()
                if not it:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Item with ID {item_id} not found"
                    )
                items_map[item_id] = it

            # 6. Verify inventory stock for PRODUCT items
            for item_id, req_qty in item_quantities.items():
                it = items_map[item_id]
                if it["type"] == "PRODUCT":
                    cursor.execute(
                        "SELECT quantity FROM inventory WHERE item_id = %s",
                        (item_id,)
                    )
                    inv = cursor.fetchone()
                    avail_qty = Decimal(str(inv["quantity"])) if inv else Decimal("0")

                    if avail_qty < req_qty:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Insufficient stock for product '{it['name']}'. Available: {avail_qty}, Requested: {req_qty}"
                        )

            # 7. Calculate calculations deterministically
            calculated_lines = []
            subtotal = Decimal("0.00")
            total_gst_amount = Decimal("0.00")

            for line in payload.items:
                it = items_map[line.item_id]
                qty = Decimal(str(line.quantity))
                unit_price = Decimal(str(it["price"]))

                line_subtotal = (qty * unit_price).quantize(Decimal("0.01"))

                gst_rate = Decimal(str(it["gst_rate"])) if (it.get("gst_applicable") and it.get("gst_rate") is not None) else Decimal("0.00")
                line_gst_amount = (line_subtotal * (gst_rate / Decimal("100"))).quantize(Decimal("0.01"))
                line_total = line_subtotal + line_gst_amount

                calculated_lines.append({
                    "item_id": line.item_id,
                    "item_name": it["name"],
                    "quantity": qty,
                    "unit_price": unit_price,
                    "gst_rate": gst_rate,
                    "gst_amount": line_gst_amount,
                    "line_total": line_total,
                })

                subtotal += line_subtotal
                total_gst_amount += line_gst_amount

            discount = Decimal(str(payload.discount or "0.00")).quantize(Decimal("0.01"))
            grand_total = max(Decimal("0.00"), subtotal - discount) + total_gst_amount

            # 8. Insert invoice
            cursor.execute(
                """
                INSERT INTO invoices
                (customer_id, invoice_number, invoice_date, subtotal, discount, gst_amount, grand_total, status, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING invoice_id
                """,
                (
                    payload.customer_id,
                    invoice_number,
                    today,
                    subtotal,
                    discount,
                    total_gst_amount,
                    grand_total,
                    "CREATED"
                )
            )
            invoice_id = cursor.fetchone()["invoice_id"]

            # 9. Insert line items
            for cl in calculated_lines:
                cursor.execute(
                    """
                    INSERT INTO invoice_items
                    (invoice_id, item_id, item_name, quantity, unit_price, gst_rate, gst_amount, line_total)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        invoice_id,
                        cl["item_id"],
                        cl["item_name"],
                        cl["quantity"],
                        cl["unit_price"],
                        cl["gst_rate"],
                        cl["gst_amount"],
                        cl["line_total"]
                    )
                )

            # 10. Deduct stock for PRODUCT items
            for item_id, req_qty in item_quantities.items():
                if items_map[item_id]["type"] == "PRODUCT":
                    cursor.execute(
                        """
                        UPDATE inventory
                        SET quantity = quantity - %s, updated_at = NOW()
                        WHERE item_id = %s
                        """,
                        (req_qty, item_id)
                    )

        connection.commit()

        return {
            "message": "Invoice created successfully",
            "invoice_id": invoice_id,
            "invoice_number": invoice_number,
            "grand_total": grand_total
        }

    except HTTPException:
        if connection:
            connection.rollback()
        raise

    except Exception as e:
        if connection:
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if connection:
            connection.close()


@app.get("/invoices", response_model=list[InvoiceResponse])
def get_invoices():
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                SELECT invoice_id, customer_id, invoice_number, invoice_date,
                       subtotal, discount, gst_amount, grand_total, status, created_at
                FROM invoices
                ORDER BY invoice_id DESC
                """
            )
            invoices = cursor.fetchall()

        return invoices

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if connection:
            connection.close()


@app.get("/invoices/{invoice_id}", response_model=InvoiceDetailResponse)
def get_invoice_detail(invoice_id: int):
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                SELECT invoice_id, customer_id, invoice_number, invoice_date,
                       subtotal, discount, gst_amount, grand_total, status, created_at
                FROM invoices
                WHERE invoice_id = %s
                """,
                (invoice_id,)
            )
            inv = cursor.fetchone()

            if not inv:
                raise HTTPException(
                    status_code=404,
                    detail=f"Invoice with ID {invoice_id} not found"
                )

            cursor.execute(
                """
                SELECT customer_id, customer_type, name, phone, email, address, gstin
                FROM customers
                WHERE customer_id = %s
                """,
                (inv["customer_id"],)
            )
            cust = cursor.fetchone()

            cursor.execute(
                """
                SELECT invoice_item_id, invoice_id, item_id, item_name,
                       quantity, unit_price, gst_rate, gst_amount, line_total
                FROM invoice_items
                WHERE invoice_id = %s
                ORDER BY invoice_item_id ASC
                """,
                (invoice_id,)
            )
            line_items = cursor.fetchall()

            inv_dict = dict(inv)
            inv_dict["customer"] = dict(cust) if cust else {}
            inv_dict["items"] = line_items

        return inv_dict

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if connection:
            connection.close()


@app.get("/invoices/{invoice_id}/pdf")
def get_invoice_pdf(invoice_id: int):
    invoice_detail = get_invoice_detail(invoice_id)

    # Retrieve business profile to pass to dynamic PDF generator
    biz_profile = None
    connection = None
    try:
        connection = get_connection()
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                "SELECT business_id, business_name, owner_name, address, phone, email, gstin, invoice_prefix "
                "FROM business LIMIT 1"
            )
            biz_profile = cursor.fetchone()
    except Exception:
        biz_profile = None
    finally:
        if connection:
            connection.close()

    pdf_bytes = generate_invoice_pdf(invoice_detail, business_data=biz_profile)

    inv_num_safe = str(invoice_detail.get("invoice_number", f"INV_{invoice_id}")).replace("/", "_").replace("\\", "_")
    filename = f"Invoice_{inv_num_safe}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@app.put("/invoices/{invoice_id}/cancel")
def cancel_invoice(invoice_id: int):
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                "SELECT invoice_id, status FROM invoices WHERE invoice_id = %s",
                (invoice_id,)
            )
            inv = cursor.fetchone()

            if not inv:
                raise HTTPException(
                    status_code=404,
                    detail=f"Invoice with ID {invoice_id} not found"
                )

            if inv["status"] == "CANCELLED":
                raise HTTPException(
                    status_code=400,
                    detail="Invoice is already cancelled"
                )

            if inv["status"] != "CREATED":
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot cancel invoice with status '{inv['status']}'"
                )

            cursor.execute(
                """
                SELECT ii.item_id, ii.quantity, it.type
                FROM invoice_items ii
                JOIN items it ON ii.item_id = it.item_id
                WHERE ii.invoice_id = %s
                """,
                (invoice_id,)
            )
            line_items = cursor.fetchall()

            for item in line_items:
                if item["type"] == "PRODUCT":
                    cursor.execute(
                        """
                        UPDATE inventory
                        SET quantity = quantity + %s, updated_at = NOW()
                        WHERE item_id = %s
                        """,
                        (item["quantity"], item["item_id"])
                    )

            cursor.execute(
                "UPDATE invoices SET status = 'CANCELLED' WHERE invoice_id = %s",
                (invoice_id,)
            )

        connection.commit()

        return {
            "message": "Invoice cancelled successfully",
            "invoice_id": invoice_id,
            "status": "CANCELLED"
        }

    except HTTPException:
        if connection:
            connection.rollback()
        raise

    except Exception as e:
        if connection:
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if connection:
            connection.close()


@app.get("/expenses", response_model=list[ExpenseResponse])
def get_expenses():
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("SELECT * FROM expenses ORDER BY expense_date DESC, expense_id DESC")
            expenses = cursor.fetchall()

        return expenses

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if connection:
            connection.close()


@app.post("/expenses")
def create_expense(expense: ExpenseCreate):
    connection = None

    try:
        connection = get_connection()

        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO expenses
                (category, amount, description, expense_date)
                VALUES (%s, %s, %s, %s)
                RETURNING expense_id
                """,
                (
                    expense.category,
                    expense.amount,
                    expense.description,
                    expense.expense_date,
                ),
            )

            expense_id = cursor.fetchone()[0]

        connection.commit()

        return {
            "message": "Expense created successfully",
            "expense_id": expense_id
        }

    except Exception as e:
        if connection:
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if connection:
            connection.close()


@app.post("/ai/chat", response_model=AIChatResponse)
def ai_chat_endpoint(payload: AIChatRequest):
    """
    Main AI Assistant endpoint interfacing local Ollama (gemma3:1b)
    with controlled PostgreSQL backend tools.
    """
    try:
        return process_chat_request(payload.message)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI Agent processing error: {str(e)}"
        )




