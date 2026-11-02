"""
Direct verification of backend FastAPI endpoint functions:
- health_check()
- get_customers()
- get_inventory()
- get_low_stock_inventory()
- get_invoices()
- get_expenses()
- ai_chat_endpoint()
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

from app.main import (
    health_check,
    get_customers,
    get_inventory,
    get_low_stock_inventory,
    get_invoices,
    get_expenses,
    ai_chat_endpoint,
)
from app.ai.schemas import AIChatRequest

def verify_all_endpoints():
    print("==================================================")
    print("=== VERIFYING BACKEND ENDPOINT FUNCTIONS ===")
    print("==================================================")

    # 1. Health
    h = health_check()
    assert h.get("status") == "healthy", f"Health check failed: {h}"
    print(f"[PASS] /health -> {h}")

    # 2. Customers
    custs = get_customers()
    assert isinstance(custs, list) and len(custs) > 0, f"Failed customers: {custs}"
    print(f"[PASS] /customers -> {len(custs)} customers returned")

    # 3. Inventory
    inv = get_inventory()
    assert isinstance(inv, list) and len(inv) > 0, f"Failed inventory: {inv}"
    print(f"[PASS] /inventory -> {len(inv)} items returned")

    # 4. Low stock inventory
    low_stock = get_low_stock_inventory()
    assert isinstance(low_stock, list), f"Failed low stock: {low_stock}"
    print(f"[PASS] /inventory/low-stock -> {len(low_stock)} items returned")

    # 5. Invoices
    invoices = get_invoices()
    assert isinstance(invoices, list) and len(invoices) > 0, f"Failed invoices: {invoices}"
    print(f"[PASS] /invoices -> {len(invoices)} invoices returned")

    # 6. Expenses
    expenses = get_expenses()
    assert isinstance(expenses, list) and len(expenses) > 0, f"Failed expenses: {expenses}"
    print(f"[PASS] /expenses -> {len(expenses)} expenses returned")

    # 7. AI Chat - All-time expenses
    ai_res_all = ai_chat_endpoint(AIChatRequest(message="total expenses"))
    assert ai_res_all.status == "success"
    assert ai_res_all.tool_used == "get_expense_summary"
    assert ai_res_all.data.get("period") == "all"
    assert ai_res_all.data.get("total_expenses") == 72000.0
    print(f"[PASS] /ai/chat ('total expenses') -> period='all', total=Rs. 72,000.00")

    # 8. AI Chat - Current-month expenses
    ai_res_month = ai_chat_endpoint(AIChatRequest(message="this month's expenses"))
    assert ai_res_month.status == "success"
    assert ai_res_month.tool_used == "get_expense_summary"
    assert ai_res_month.data.get("period") == "month"
    assert ai_res_month.data.get("total_expenses") == 0.0
    assert ai_res_month.data.get("has_older_records") is True
    print(f"[PASS] /ai/chat ('this month's expenses') -> period='month', total=Rs. 0.00, context='September 2026'")

    # 9. AI Chat - Business performance
    ai_res_perf = ai_chat_endpoint(AIChatRequest(message="how is my business performing?"))
    assert ai_res_perf.status == "success"
    assert ai_res_perf.tool_used == "get_business_performance"
    assert ai_res_perf.data.get("total_sales") == 14590.82
    assert ai_res_perf.data.get("total_expenses") == 72000.0
    print(f"[PASS] /ai/chat ('business performance') -> sales=14,590.82, expenses=72,000.00")

    # 10. AI Chat - Business Advisor & Recommendations
    ai_res_adv = ai_chat_endpoint(AIChatRequest(message="Give me business recommendations."))
    assert ai_res_adv.status == "success"
    assert ai_res_adv.tool_used == "get_business_advisor_insights"
    assert "recommendations" in ai_res_adv.data
    assert len(ai_res_adv.data["recommendations"]) >= 3
    print(f"[PASS] /ai/chat ('business recommendations') -> tool='get_business_advisor_insights', {len(ai_res_adv.data['recommendations'])} recommendations")

    print("\n==================================================")
    print("=== ALL BACKEND ENDPOINTS VERIFIED AND WORKING! ===")
    print("==================================================")

if __name__ == "__main__":
    verify_all_endpoints()
