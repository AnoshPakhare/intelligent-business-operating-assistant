"""
Part D Verification Script for Phase 7 AI Agent Stabilization.
Tests all 6 required prompts, verifies tool selection, exact numbers,
natural language synthesis with Ollama, and offline fallback behavior.
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')
from unittest.mock import patch
from app.ai.agent import process_chat_request
from app.ai.ollama_client import is_ollama_available

def test_queries():
    print("=" * 60)
    print("OLLAMA SERVICE STATUS:")
    available = is_ollama_available()
    print(f"Ollama Available: {available}")
    print("=" * 60)

    test_cases = [
        {
            "query": "Which products are low in stock?",
            "expected_tool": "get_low_stock_products",
            "expected_content": ["HDMI Cable", "3", "5"],
            "forbidden_content": ["expense", "revenue", "profit"],
        },
        {
            "query": "Show today's sales.",
            "expected_tool": "get_todays_sales",
            "expected_content": ["Rs. 0.00", "0"],
            "forbidden_content": ["reorder level", "low stock", "expense"],
        },
        {
            "query": "Kul kharcha kitna hai?",
            "expected_tool": "get_expense_summary",
            "expected_content": ["72,000", "Salary", "Rent"],
            "forbidden_content": ["reorder level"],
        },
        {
            "query": "Is mahine ka kharcha batao.",
            "expected_tool": "get_expense_summary",
            "expected_content": ["0.00", "September 2026", "72,000"],
            "forbidden_content": ["reorder level", "HDMI Cable"],
        },
        {
            "query": "Business kaisa perform kar raha hai?",
            "expected_tool": "get_business_performance",
            "expected_content": ["14,590.82", "72,000.00", "57,409.18"],
            "forbidden_content": ["HDMI Cable"],
        },
        {
            "query": "Mujhe business advice aur recommendations batao.",
            "expected_tool": "get_business_advisor_insights",
            "expected_content": ["57,409.18", "HDMI Cable", "Salary"],
            "forbidden_content": [],
        },
    ]

    print("\n--- 1. TESTING LIVE QUERIES WITH OLLAMA ---")
    for i, tc in enumerate(test_cases, 1):
        q = tc["query"]
        print(f"\n[Test {i}] Query: '{q}'")
        res = process_chat_request(q)
        print(f"Tool Used: {res.tool_used} (Expected: {tc['expected_tool']})")
        assert res.tool_used == tc["expected_tool"], f"Tool mismatch for '{q}'"
        print(f"Status: {res.status}")
        assert res.status == "success"

        # Check for fallback message
        is_fallback = "running in offline mode" in res.response
        print(f"Synthesis Mode: {'OFFLINE FALLBACK' if is_fallback else 'ONLINE OLLAMA GEMMA3:1B'}")
        print(f"Response:\n{res.response}\n")

        # Verify key data numbers
        for ec in tc["expected_content"]:
            assert ec.lower() in res.response.lower() or (ec in str(res.data)), \
                f"Expected content '{ec}' not found in response or data for query '{q}'"

        # Check forbidden hallucinations
        for fc in tc["forbidden_content"]:
            assert fc.lower() not in res.response.lower(), \
                f"Forbidden leaked content '{fc}' found in response for query '{q}'"

        print(f"[PASS] Test {i} passed.")

    print("\n" + "=" * 60)
    print("--- 2. TESTING OFFLINE FALLBACK (Ollama genuinely unavailable) ---")
    print("=" * 60)

    with patch("app.ai.agent.generate_completion", return_value={"success": False, "error": "IBOA AI is currently unavailable. Please make sure Ollama is running."}):
        for i, tc in enumerate(test_cases, 1):
            q = tc["query"]
            print(f"\n[Offline Test {i}] Query: '{q}'")
            res = process_chat_request(q)
            assert res.status == "success"
            assert res.tool_used == tc["expected_tool"]
            assert "running in offline mode" in res.response, f"Offline message missing in query '{q}'"
            print(f"[PASS] Offline fallback generated valid response with notice.")

    print("\n" + "=" * 60)
    print("ALL PART D VERIFICATION TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    test_queries()
