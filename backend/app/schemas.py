from decimal import Decimal
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class CustomerCreate(BaseModel):
    customer_type: str
    name: str
    phone: str
    email: Optional[str] = None
    address: str
    gstin: Optional[str] = None


class ItemCreate(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    price: Decimal
    unit: str
    gst_applicable: bool
    gst_rate: Optional[Decimal] = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ("PRODUCT", "SERVICE"):
            raise ValueError("type must be either PRODUCT or SERVICE")
        return v


class ItemResponse(ItemCreate):
    item_id: int
    created_at: Optional[datetime] = None


class InventoryUpdate(BaseModel):
    quantity: int = Field(..., ge=0)
    reorder_level: int = Field(..., ge=0)


class InventoryResponse(BaseModel):
    inventory_id: int
    item_id: int
    item_name: str
    quantity: int
    reorder_level: int
    updated_at: Optional[datetime] = None


class InvoiceItemCreate(BaseModel):
    item_id: int
    quantity: Decimal = Field(..., gt=0)


class InvoiceCreate(BaseModel):
    customer_id: int
    items: list[InvoiceItemCreate] = Field(..., min_length=1)
    discount: Optional[Decimal] = Field(default=Decimal("0.00"), ge=0)


class InvoiceItemResponse(BaseModel):
    invoice_item_id: int
    invoice_id: int
    item_id: int
    item_name: str
    quantity: Decimal
    unit_price: Decimal
    gst_rate: Decimal
    gst_amount: Decimal
    line_total: Decimal


class InvoiceResponse(BaseModel):
    invoice_id: int
    customer_id: int
    invoice_number: str
    invoice_date: date
    subtotal: Decimal
    discount: Decimal
    gst_amount: Decimal
    grand_total: Decimal
    status: str
    created_at: Optional[datetime] = None


class InvoiceDetailResponse(InvoiceResponse):
    customer: dict
    items: list[InvoiceItemResponse]

