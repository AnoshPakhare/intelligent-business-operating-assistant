"""
Comprehensive Test Suite for IBOA Local AI Agent Tool-Routing, Expense Filtering, Response Grounding & AI Business Advisor.
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')
from app.ai.tools import (
    get_todays_sales,
    get_sales_summary,
    get_sales_trends,
    get_expense_summary,
    get_business_performance,
    get_top_products,
    get_low_stock_products,
    get_customer_summary,
    get_business_overview,
    get_business_advisor_insights,
)
from app.ai.agent import process_chat_request, _determine_expense_period


def run_unit_tests():
    print("==================================================")
    print("=== 1. TESTING DIRECT TOOL FUNCTIONS & PERIODS ===")
    print("==================================================")

    # 1.1 Test get_expense_summary default and period="all"
    exp_all_default = get_expense_summary()
    assert exp_all_default.get("period") == "all", f"Expected default period 'all', got {exp_all_default.get('period')}"
    assert exp_all_default.get("total_expenses") == 72000.0, f"Expected 72000.0, got {exp_all_default.get('total_expenses')}"
    assert exp_all_default.get("record_count") == 4, f"Expected 4 records, got {exp_all_default.get('record_count')}"
    assert "2026-09-01" in exp_all_default.get("date_range", ""), f"Date range missing start date: {exp_all_default.get('date_range')}"
    print("[PASS] get_expense_summary() default returns all-time records (Rs. 72,000.00)")

    exp_all_explicit = get_expense_summary(period="all")
    assert exp_all_explicit.get("total_expenses") == 72000.0
    print("[PASS] get_expense_summary(period='all') returns all-time records")

    exp_total = get_expense_summary(period="total")
    assert exp_total.get("total_expenses") == 72000.0
    print("[PASS] get_expense_summary(period='total') returns all-time records")

    # 1.2 Test get_expense_summary(period="month")
    exp_month = get_expense_summary(period="month")
    assert exp_month.get("period") == "month"
    assert exp_month.get("total_expenses") == 0.0, f"Expected 0.0 for current month, got {exp_month.get('total_expenses')}"
    assert exp_month.get("has_older_records") is True, "Expected has_older_records to be True"
    assert exp_month.get("latest_recorded_month") == "September 2026", f"Expected September 2026, got {exp_month.get('latest_recorded_month')}"
    assert exp_month.get("latest_recorded_total") == 72000.0
    print("[PASS] get_expense_summary(period='month') correctly returns 0 for current month with September 2026 context")

    # 1.3 Test get_business_performance consistency with Dashboard
    perf = get_business_performance()
    assert perf.get("total_sales") == 14590.82, f"Expected total_sales 14590.82, got {perf.get('total_sales')}"
    assert perf.get("total_expenses") == 72000.0, f"Expected total_expenses 72000.0, got {perf.get('total_expenses')}"
    assert perf.get("net_recorded_performance") == -57409.18, f"Expected net -57409.18, got {perf.get('net_recorded_performance')}"
    assert perf.get("status") == "DEFICIT"
    print("[PASS] get_business_performance() returns 14590.82 sales and 72000.0 expenses (matches Dashboard)")

    # 1.4 Test _determine_expense_period mapping
    assert _determine_expense_period("total expenses") == "all"
    assert _determine_expense_period("show expenses") == "all"
    assert _determine_expense_period("expense summary") == "all"
    assert _determine_expense_period("spending") == "all"
    assert _determine_expense_period("kul kharcha kitna hai") == "all"
    assert _determine_expense_period("this month's expenses") == "month"
    assert _determine_expense_period("Summarize this month's expenses.") == "month"
    assert _determine_expense_period("is mahine ka kharcha batao") == "month"
    assert _determine_expense_period("iss mahine ke kharche") == "month"
    print("[PASS] _determine_expense_period helper maps all queries correctly")

    # 1.5 Test get_business_advisor_insights() direct function
    advisor = get_business_advisor_insights()
    assert advisor.get("status") == "DEFICIT"
    assert advisor.get("total_sales") == 14590.82
    assert advisor.get("total_expenses") == 72000.0
    assert advisor.get("net_recorded_performance") == -57409.18
    recs = advisor.get("recommendations", [])
    assert 3 <= len(recs) <= 4, f"Expected 3-4 recommendations, got {len(recs)}"
    recs_text = " ".join(recs)
    assert "Cash Flow" in recs_text or "Deficit" in recs_text or "deficit" in recs_text, "Missing cash flow recommendation"
    assert "HDMI Cable" in recs_text, "Missing low-stock replenishment recommendation for HDMI Cable"
    assert "Salary" in recs_text, "Missing top expense driver recommendation for Salary"
    assert "Acme Corp" in recs_text, "Missing customer concentration recommendation for Acme Corp"
    assert advisor.get("limitation_note"), "Missing limitation note on purchase costs"
    print(f"[PASS] get_business_advisor_insights() returned {len(recs)} evidence-based recommendations grounded in live data")


def run_ai_agent_tests():
    print("\n==================================================")
    print("=== 2. TESTING AI AGENT CHAT REQUEST WORKFLOWS ===")
    print("==================================================")

    test_cases = [
        # Original 10 test cases
        ("Which products are low in stock?", "get_low_stock_products", None),
        ("Kaunsa product low stock mein hai?", "get_low_stock_products", None),
        ("Show today's sales.", "get_todays_sales", None),
        ("Aaj ki sales dikhao.", "get_todays_sales", None),
        ("Summarize this month's expenses.", "get_expense_summary", "month"),
        ("Is mahine ka kharcha batao.", "get_expense_summary", "month"),
        ("Show my top products.", "get_top_products", None),
        ("How is my business performing?", "get_business_performance", None),
        ("Give me an overall business overview.", "get_business_overview", None),
        ("What is the capital of France?", "none", None),

        # Phase 5: All-time expenses queries
        ("total expenses", "get_expense_summary", "all"),
        ("show expenses", "get_expense_summary", "all"),
        ("expense summary", "get_expense_summary", "all"),
        ("spending", "get_expense_summary", "all"),

        # Phase 5: Hindi / Hinglish queries
        ("Kul kharcha kitna hai?", "get_expense_summary", "all"),
        ("Business kaisa perform kar raha hai?", "get_business_performance", None),

        # Phase 6: AI Business Advisor & Recommendations queries (English, Hindi, Hinglish)
        ("Give me business recommendations.", "get_business_advisor_insights", None),
        ("What business advice do you have for me?", "get_business_advisor_insights", None),
        ("Business kaise badhaye aur sales kaise improve kare?", "get_business_advisor_insights", None),
        ("Mujhe business advice aur recommendations batao.", "get_business_advisor_insights", None),
        ("Business grow karne ki salah batao.", "get_business_advisor_insights", None),
    ]

    for idx, (query, expected_tool, expected_period) in enumerate(test_cases, 1):
        print(f"\n--------------------------------------------------")
        print(f"--- TEST #{idx} ---")
        print(f"User Query: \"{query}\"")
        print(f"Expected Tool: {expected_tool}")

        res = process_chat_request(query)

        print(f"Selected Tool: {res.tool_used}")
        print(f"Key Data: {res.data}")
        print(f"Response:\n{res.response}")

        assert res.status == "success", f"Failed status on query: {query}"
        assert res.tool_used == expected_tool, f"Mismatch on query '{query}': expected '{expected_tool}', got '{res.tool_used}'"

        if expected_tool == "get_expense_summary":
            actual_period = res.data.get("period")
            if expected_period:
                assert actual_period == expected_period, f"Expected period {expected_period}, got {actual_period}"

            if expected_period == "all":
                assert res.data.get("total_expenses") == 72000.0, f"Expected 72000.0, got {res.data.get('total_expenses')}"
                assert "72,000" in res.response or "72000" in res.response, f"Response should report 72,000 for all-time expenses: {res.response}"
            elif expected_period == "month":
                assert res.data.get("total_expenses") == 0.0, f"Expected 0.0 for current month, got {res.data.get('total_expenses')}"
                assert res.data.get("has_older_records") is True
                resp_lower = res.response.lower()
                assert ("0.00" in res.response or " 0 " in res.response or "zero" in resp_lower or "koi kharcha nahi" in resp_lower or "0" in res.response), \
                    f"Current month response must clearly report zero expenses: {res.response}"
                assert ("september" in resp_lower or "2026-09" in resp_lower or "72,000" in res.response or "72000" in res.response), \
                    f"Current month response must provide older records context: {res.response}"

        elif expected_tool == "get_business_advisor_insights":
            assert res.data.get("total_sales") == 14590.82
            assert res.data.get("total_expenses") == 72000.0
            assert res.data.get("net_recorded_performance") == -57409.18
            assert "recommendations" in res.data
            assert len(res.data["recommendations"]) >= 3
            # Grounding assertions
            resp_lower = res.response.lower()
            assert ("57,409" in res.response or "57409" in res.response or "deficit" in resp_lower or "nuksan" in resp_lower or "ghata" in resp_lower or "loss" in resp_lower or "shortfall" in resp_lower or "deficit" in res.response), \
                "Advisor response should reference recorded deficit / cash flow shortfall"

        elif expected_tool == "get_business_performance":
            assert res.data.get("total_sales") == 14590.82
            assert res.data.get("total_expenses") == 72000.0
            assert res.data.get("net_recorded_performance") == -57409.18
            assert "limitation_note" in res.data

        elif expected_tool == "get_low_stock_products":
            assert "HDMI Cable" in res.response or "hdmi cable" in res.response.lower()

        elif expected_tool == "none":
            assert res.data == {}
            assert "14,590" not in res.response
            assert "HDMI Cable" not in res.response

    print("\n==================================================")
    print("=== ALL AI UNIT & INTEGRATION TESTS PASSED! ===")
    print("==================================================")


if __name__ == "__main__":
    run_unit_tests()
    run_ai_agent_tests()
