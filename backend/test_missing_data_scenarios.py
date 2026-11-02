"""
Unit Test Suite for Missing-Data, Zero-Sales, and Edge Cases in Business Advisor.
"""
import sys
from unittest.mock import patch
sys.stdout.reconfigure(encoding='utf-8')
from app.ai.tools import get_business_advisor_insights


def test_missing_data_scenarios():
    print("==================================================")
    print("=== TESTING MISSING-DATA & EDGE-CASE SCENARIOS ===")
    print("==================================================")

    # 1. Zero-sales & Zero-expenses scenario
    with patch("app.ai.tools.get_business_performance", return_value={
        "total_sales": 0.0,
        "total_expenses": 0.0,
        "net_recorded_performance": 0.0,
        "status": "NEUTRAL",
        "limitation_note": "Cost data missing"
    }), patch("app.ai.tools.get_expense_summary", return_value={
        "categories": []
    }), patch("app.ai.tools.get_top_products", return_value={
        "top_products": []
    }), patch("app.ai.tools.get_low_stock_products", return_value={
        "low_stock_items": []
    }), patch("app.ai.tools.get_customer_summary", return_value={
        "top_customers": [],
        "total_customers": 0
    }), patch("app.ai.tools.get_sales_trends", return_value={
        "direction": "NEUTRAL",
        "percentage_change": 0.0
    }):
        insights = get_business_advisor_insights()
        assert insights["total_sales"] == 0.0
        assert insights["total_expenses"] == 0.0
        assert insights["net_recorded_performance"] == 0.0
        recs = insights["recommendations"]
        assert len(recs) == 4, f"Expected 4 recommendations in zero-data scenario, got {len(recs)}"
        recs_str = " ".join(recs)
        assert "Surplus" in recs_str or "surplus" in recs_str or "Stability" in recs_str
        assert "Product & Inventory Baseline" in recs_str
        assert "Expense Tracking" in recs_str
        assert "Customer Pipeline" in recs_str
        print("[PASS] Zero-data / clean-slate scenario generates 4 valid, grounded recommendations")

    # 2. Healthy stock (zero low-stock items) with top products present
    with patch("app.ai.tools.get_business_performance", return_value={
        "total_sales": 50000.0,
        "total_expenses": 20000.0,
        "net_recorded_performance": 30000.0,
        "status": "POSITIVE",
        "limitation_note": "Cost data missing"
    }), patch("app.ai.tools.get_expense_summary", return_value={
        "categories": [{"category": "Rent", "amount": 20000.0, "percentage": 100.0}]
    }), patch("app.ai.tools.get_top_products", return_value={
        "top_products": [{"item_name": "Premium Keyboard", "quantity_sold": 10.0, "total_revenue": 50000.0}]
    }), patch("app.ai.tools.get_low_stock_products", return_value={
        "low_stock_items": []
    }), patch("app.ai.tools.get_customer_summary", return_value={
        "top_customers": [{"customer_name": "Global Corp", "total_spent": 50000.0}],
        "total_customers": 5
    }), patch("app.ai.tools.get_sales_trends", return_value={
        "direction": "UP",
        "percentage_change": 25.0
    }):
        insights = get_business_advisor_insights()
        assert insights["status"] == "POSITIVE"
        assert insights["net_recorded_performance"] == 30000.0
        recs = insights["recommendations"]
        assert len(recs) == 4
        recs_str = " ".join(recs)
        assert "Financial Stability: Recorded operating surplus is Rs. 30,000.00" in recs_str
        assert "Premium Keyboard" in recs_str
        assert "Rent" in recs_str
        assert "Global Corp" in recs_str
        print("[PASS] Operating surplus with healthy stock scenario generates 4 valid recommendations")

    # 3. Deficit with low-stock items present
    with patch("app.ai.tools.get_business_performance", return_value={
        "total_sales": 10000.0,
        "total_expenses": 40000.0,
        "net_recorded_performance": -30000.0,
        "status": "DEFICIT",
        "limitation_note": "Cost data missing"
    }), patch("app.ai.tools.get_expense_summary", return_value={
        "categories": [{"category": "Salary", "amount": 40000.0, "percentage": 100.0}]
    }), patch("app.ai.tools.get_top_products", return_value={
        "top_products": [{"item_name": "Mouse", "quantity_sold": 5.0, "total_revenue": 10000.0}]
    }), patch("app.ai.tools.get_low_stock_products", return_value={
        "low_stock_items": [{"product_name": "Wireless Mouse", "current_quantity": 1, "reorder_level": 5}]
    }), patch("app.ai.tools.get_customer_summary", return_value={
        "top_customers": [{"customer_name": "Local Shop", "total_spent": 10000.0}],
        "total_customers": 2
    }), patch("app.ai.tools.get_sales_trends", return_value={
        "direction": "DOWN",
        "percentage_change": -10.0
    }):
        insights = get_business_advisor_insights()
        assert insights["status"] == "DEFICIT"
        assert insights["low_stock_count"] == 1
        recs = insights["recommendations"]
        assert len(recs) == 4
        recs_str = " ".join(recs)
        assert "Cash Flow Control" in recs_str
        assert "Wireless Mouse" in recs_str
        assert "Salary" in recs_str
        assert "Local Shop" in recs_str
        print("[PASS] Operating deficit with urgent low-stock scenario generates 4 valid recommendations")

    print("\n==================================================")
    print("=== ALL MISSING-DATA & EDGE-CASE TESTS PASSED! ===")
    print("==================================================")


if __name__ == "__main__":
    test_missing_data_scenarios()
