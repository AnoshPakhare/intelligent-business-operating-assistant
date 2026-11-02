import logging
from datetime import date, datetime, timedelta
from psycopg.rows import dict_row
from app.database import get_connection

logger = logging.getLogger(__name__)

LIMITATION_MISSING_COST_PRICE = (
    "Product cost/purchase-price data is not stored, so complete accounting profit "
    "or product-level gross margin cannot be calculated."
)


def get_todays_sales() -> dict:
    """
    Returns total sales, invoice count, and tax breakdown for CREATED invoices issued today.
    """
    connection = None
    try:
        connection = get_connection()
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                SELECT 
                    COUNT(*) AS invoice_count,
                    COALESCE(SUM(grand_total), 0) AS total_sales,
                    COALESCE(SUM(subtotal), 0) AS total_subtotal,
                    COALESCE(SUM(discount), 0) AS total_discount,
                    COALESCE(SUM(gst_amount), 0) AS total_gst
                FROM invoices
                WHERE status = 'CREATED' AND invoice_date = CURRENT_DATE
                """
            )
            row = cursor.fetchone()

        total_sales = float(row["total_sales"])
        return {
            "period": "today",
            "date": str(date.today()),
            "invoice_count": int(row["invoice_count"]),
            "total_sales": total_sales,
            "formatted_total_sales": f"Rs. {total_sales:,.2f}",
            "subtotal": float(row["total_subtotal"]),
            "discount": float(row["total_discount"]),
            "gst_amount": float(row["total_gst"]),
        }
    except Exception as e:
        logger.error(f"Error in get_todays_sales: {e}")
        return {"error": f"Failed to fetch today's sales: {str(e)}"}
    finally:
        if connection:
            connection.close()


def get_sales_summary(period: str = "month") -> dict:
    """
    Returns revenue, invoice count, subtotal, discount, and GST breakdown for CREATED invoices.
    Period options: 'today', 'week', 'month', 'year'.
    """
    period_lower = period.lower() if period else "month"
    today = date.today()

    if period_lower == "today":
        start_date = today
    elif period_lower == "week":
        start_date = today - timedelta(days=6)
    elif period_lower == "year":
        start_date = date(today.year, 1, 1)
    else:  # default month
        start_date = date(today.year, today.month, 1)

    connection = None
    try:
        connection = get_connection()
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                SELECT 
                    COUNT(*) AS invoice_count,
                    COALESCE(SUM(grand_total), 0) AS total_sales,
                    COALESCE(SUM(subtotal), 0) AS total_subtotal,
                    COALESCE(SUM(discount), 0) AS total_discount,
                    COALESCE(SUM(gst_amount), 0) AS total_gst
                FROM invoices
                WHERE status = 'CREATED' AND invoice_date >= %s
                """,
                (start_date,),
            )
            row = cursor.fetchone()

        total_sales = float(row["total_sales"])
        return {
            "period": period_lower,
            "start_date": str(start_date),
            "end_date": str(today),
            "invoice_count": int(row["invoice_count"]),
            "total_sales": total_sales,
            "formatted_total_sales": f"Rs. {total_sales:,.2f}",
            "subtotal": float(row["total_subtotal"]),
            "discount": float(row["total_discount"]),
            "gst_amount": float(row["total_gst"]),
        }
    except Exception as e:
        logger.error(f"Error in get_sales_summary: {e}")
        return {"error": f"Failed to fetch sales summary: {str(e)}"}
    finally:
        if connection:
            connection.close()


def get_sales_trends(period: str = "month") -> dict:
    """
    Compares sales between current period and previous period.
    Mathematics performed in Python.
    """
    today = date.today()
    period_lower = period.lower() if period else "month"

    if period_lower == "week":
        curr_start = today - timedelta(days=6)
        prev_start = curr_start - timedelta(days=7)
        prev_end = curr_start - timedelta(days=1)
    else:  # default month
        curr_start = date(today.year, today.month, 1)
        # Previous month calculation
        if today.month == 1:
            prev_start = date(today.year - 1, 12, 1)
            prev_end = date(today.year - 1, 12, 31)
        else:
            prev_start = date(today.year, today.month - 1, 1)
            # Last day of previous month
            prev_end = curr_start - timedelta(days=1)

    connection = None
    try:
        connection = get_connection()
        with connection.cursor(row_factory=dict_row) as cursor:
            # Current period sales
            cursor.execute(
                """
                SELECT COALESCE(SUM(grand_total), 0) AS sales, COUNT(*) AS cnt
                FROM invoices
                WHERE status = 'CREATED' AND invoice_date >= %s AND invoice_date <= %s
                """,
                (curr_start, today),
            )
            curr_row = cursor.fetchone()

            # Previous period sales
            cursor.execute(
                """
                SELECT COALESCE(SUM(grand_total), 0) AS sales, COUNT(*) AS cnt
                FROM invoices
                WHERE status = 'CREATED' AND invoice_date >= %s AND invoice_date <= %s
                """,
                (prev_start, prev_end),
            )
            prev_row = cursor.fetchone()

        curr_sales = float(curr_row["sales"])
        prev_sales = float(prev_row["sales"])

        abs_change = curr_sales - prev_sales

        if prev_sales > 0:
            pct_change = round((abs_change / prev_sales) * 100, 2)
        elif curr_sales > 0:
            pct_change = 100.0
        else:
            pct_change = 0.0

        if abs_change > 0:
            direction = "UP"
        elif abs_change < 0:
            direction = "DOWN"
        else:
            direction = "NEUTRAL"

        return {
            "period": period_lower,
            "current_period_sales": curr_sales,
            "formatted_current_sales": f"Rs. {curr_sales:,.2f}",
            "previous_period_sales": prev_sales,
            "formatted_previous_sales": f"Rs. {prev_sales:,.2f}",
            "absolute_change": round(abs_change, 2),
            "formatted_absolute_change": f"Rs. {abs(abs_change):,.2f}",
            "percentage_change": pct_change,
            "direction": direction,
            "current_invoice_count": int(curr_row["cnt"]),
            "previous_invoice_count": int(prev_row["cnt"]),
        }
    except Exception as e:
        logger.error(f"Error in get_sales_trends: {e}")
        return {"error": f"Failed to fetch sales trends: {str(e)}"}
    finally:
        if connection:
            connection.close()


def get_expense_summary(period: str = "all") -> dict:
    """
    Returns total expenses and category breakdown with percentages.
    Period options: 'today', 'week', 'month', 'year', 'all' (or 'total').
    """
    import calendar
    today = date.today()
    period_lower = period.lower().strip() if period else "all"

    connection = None
    try:
        connection = get_connection()
        with connection.cursor(row_factory=dict_row) as cursor:
            if period_lower in ["all", "total", "overall"]:
                cursor.execute(
                    """
                    SELECT category, SUM(amount) AS category_total
                    FROM expenses
                    GROUP BY category
                    ORDER BY category_total DESC
                    """
                )
                rows = cursor.fetchall()

                cursor.execute(
                    """
                    SELECT MIN(expense_date) AS min_date, MAX(expense_date) AS max_date, COUNT(*) AS cnt
                    FROM expenses
                    """
                )
                meta = cursor.fetchone()
                min_d = str(meta["min_date"]) if meta and meta["min_date"] else None
                max_d = str(meta["max_date"]) if meta and meta["max_date"] else None
                date_range_str = f"{min_d} to {max_d}" if min_d and max_d else None
                record_count = int(meta["cnt"]) if meta and meta["cnt"] else 0
            else:
                if period_lower == "today":
                    start_date = today
                    end_date = today
                elif period_lower == "week":
                    start_date = today - timedelta(days=6)
                    end_date = today
                elif period_lower == "year":
                    start_date = date(today.year, 1, 1)
                    end_date = today
                else:  # month
                    start_date = date(today.year, today.month, 1)
                    _, last_day = calendar.monthrange(today.year, today.month)
                    end_date = date(today.year, today.month, last_day)

                cursor.execute(
                    """
                    SELECT category, SUM(amount) AS category_total
                    FROM expenses
                    WHERE expense_date >= %s AND expense_date <= %s
                    GROUP BY category
                    ORDER BY category_total DESC
                    """,
                    (start_date, end_date),
                )
                rows = cursor.fetchall()
                date_range_str = f"{start_date} to {end_date}"
                record_count = len(rows)

            categories = []
            total_expenses = 0.0

            for row in rows:
                amt = float(row["category_total"])
                total_expenses += amt
                categories.append({
                    "category": row["category"],
                    "amount": amt,
                    "formatted_amount": f"Rs. {amt:,.2f}",
                })

            for cat in categories:
                cat["percentage"] = (
                    round((cat["amount"] / total_expenses) * 100, 1)
                    if total_expenses > 0
                    else 0.0
                )

            res = {
                "period": period_lower,
                "total_expenses": round(total_expenses, 2),
                "formatted_total_expenses": f"Rs. {total_expenses:,.2f}",
                "categories": categories,
            }

            if period_lower in ["all", "total", "overall"]:
                res["date_range"] = date_range_str
                res["record_count"] = record_count
            elif period_lower == "month":
                res["current_month"] = today.strftime("%B %Y")
                if total_expenses == 0:
                    cursor.execute(
                        """
                        SELECT 
                            TO_CHAR(expense_date, 'FMMonth YYYY') AS month_name,
                            MIN(expense_date) AS min_date,
                            MAX(expense_date) AS max_date,
                            SUM(amount) AS month_total,
                            COUNT(*) AS record_count
                        FROM expenses
                        GROUP BY DATE_TRUNC('month', expense_date), TO_CHAR(expense_date, 'FMMonth YYYY')
                        ORDER BY DATE_TRUNC('month', expense_date) DESC
                        LIMIT 1
                        """
                    )
                    latest = cursor.fetchone()
                    if latest and latest["month_total"]:
                        latest_amt = float(latest["month_total"])
                        res["has_older_records"] = True
                        res["latest_recorded_month"] = str(latest["month_name"]).strip()
                        res["latest_recorded_total"] = latest_amt
                        res["formatted_latest_recorded_total"] = f"Rs. {latest_amt:,.2f}"
                        res["latest_date_range"] = f"{latest['min_date']} to {latest['max_date']}"
                        res["latest_record_count"] = int(latest["record_count"])
                    else:
                        res["has_older_records"] = False

            return res

    except Exception as e:
        logger.error(f"Error in get_expense_summary: {e}")
        return {"error": f"Failed to fetch expense summary: {str(e)}"}
    finally:
        if connection:
            connection.close()



def get_business_performance() -> dict:
    """
    Calculates Net Recorded Performance = Recorded Sales Revenue (CREATED) - Recorded Expenses.
    Includes limitation notice regarding missing product cost prices.
    """
    connection = None
    try:
        connection = get_connection()
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                SELECT COALESCE(SUM(grand_total), 0) AS total_sales
                FROM invoices
                WHERE status = 'CREATED'
                """
            )
            sales_row = cursor.fetchone()

            cursor.execute(
                """
                SELECT COALESCE(SUM(amount), 0) AS total_expenses
                FROM expenses
                """
            )
            exp_row = cursor.fetchone()

        sales = float(sales_row["total_sales"])
        expenses = float(exp_row["total_expenses"])
        net_performance = sales - expenses

        return {
            "total_sales": sales,
            "formatted_total_sales": f"Rs. {sales:,.2f}",
            "total_expenses": expenses,
            "formatted_total_expenses": f"Rs. {expenses:,.2f}",
            "net_recorded_performance": round(net_performance, 2),
            "formatted_net_performance": f"Rs. {net_performance:,.2f}",
            "status": "POSITIVE" if net_performance >= 0 else "DEFICIT",
            "limitation_note": LIMITATION_MISSING_COST_PRICE,
        }
    except Exception as e:
        logger.error(f"Error in get_business_performance: {e}")
        return {"error": f"Failed to fetch business performance: {str(e)}"}
    finally:
        if connection:
            connection.close()


def get_top_products(limit: int = 5) -> dict:
    """
    Returns top products/services ranked by total quantity sold and revenue generated from CREATED invoices.
    """
    safe_limit = max(1, min(limit, 20))
    connection = None
    try:
        connection = get_connection()
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                SELECT 
                    ii.item_name,
                    SUM(ii.quantity) AS total_quantity_sold,
                    SUM(ii.line_total) AS total_revenue,
                    COUNT(DISTINCT ii.invoice_id) AS invoice_count
                FROM invoice_items ii
                JOIN invoices inv ON ii.invoice_id = inv.invoice_id
                WHERE inv.status = 'CREATED'
                GROUP BY ii.item_name
                ORDER BY total_revenue DESC, total_quantity_sold DESC
                LIMIT %s
                """,
                (safe_limit,),
            )
            rows = cursor.fetchall()

        products = []
        for r in rows:
            rev = float(r["total_revenue"])
            products.append({
                "item_name": r["item_name"],
                "quantity_sold": float(r["total_quantity_sold"]),
                "total_revenue": rev,
                "formatted_revenue": f"Rs. {rev:,.2f}",
                "invoice_count": int(r["invoice_count"]),
            })

        return {
            "top_products": products,
            "count": len(products),
        }
    except Exception as e:
        logger.error(f"Error in get_top_products: {e}")
        return {"error": f"Failed to fetch top products: {str(e)}"}
    finally:
        if connection:
            connection.close()


def get_low_stock_products() -> dict:
    """
    Returns products in inventory where current quantity <= reorder_level.
    Services are excluded.
    """
    connection = None
    try:
        connection = get_connection()
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                SELECT 
                    it.name AS product_name,
                    inv.quantity AS current_quantity,
                    inv.reorder_level,
                    it.unit
                FROM inventory inv
                JOIN items it ON inv.item_id = it.item_id
                WHERE it.type = 'PRODUCT' AND inv.quantity <= inv.reorder_level
                ORDER BY inv.quantity ASC
                """
            )
            rows = cursor.fetchall()

        items = []
        for r in rows:
            qty = int(r["current_quantity"])
            reorder = int(r["reorder_level"])
            status = "CRITICAL" if qty <= (reorder // 2) else "LOW"
            items.append({
                "product_name": r["product_name"],
                "current_quantity": qty,
                "reorder_level": reorder,
                "unit": r["unit"],
                "status": status,
            })

        return {
            "low_stock_count": len(items),
            "low_stock_items": items,
        }
    except Exception as e:
        logger.error(f"Error in get_low_stock_products: {e}")
        return {"error": f"Failed to fetch low stock products: {str(e)}"}
    finally:
        if connection:
            connection.close()


def get_customer_summary() -> dict:
    """
    Returns total customers, Company vs Individual breakdown, and top purchasing customers.
    """
    connection = None
    try:
        connection = get_connection()
        with connection.cursor(row_factory=dict_row) as cursor:
            # Customer counts by type
            cursor.execute(
                """
                SELECT customer_type, COUNT(*) AS cnt
                FROM customers
                GROUP BY customer_type
                """
            )
            type_rows = cursor.fetchall()

            company_count = 0
            individual_count = 0
            total_customers = 0

            for r in type_rows:
                cnt = int(r["cnt"])
                total_customers += cnt
                if r["customer_type"] == "Company":
                    company_count = cnt
                elif r["customer_type"] == "Individual":
                    individual_count = cnt

            # Top customers by CREATED invoice value
            cursor.execute(
                """
                SELECT 
                    c.name AS customer_name,
                    c.customer_type,
                    COUNT(inv.invoice_id) AS invoice_count,
                    COALESCE(SUM(inv.grand_total), 0) AS total_spent
                FROM customers c
                LEFT JOIN invoices inv ON c.customer_id = inv.customer_id AND inv.status = 'CREATED'
                GROUP BY c.customer_id, c.name, c.customer_type
                ORDER BY total_spent DESC
                LIMIT 5
                """
            )
            top_rows = cursor.fetchall()

        top_customers = []
        for r in top_rows:
            spent = float(r["total_spent"])
            top_customers.append({
                "customer_name": r["customer_name"],
                "customer_type": r["customer_type"],
                "invoice_count": int(r["invoice_count"]),
                "total_spent": spent,
                "formatted_total_spent": f"Rs. {spent:,.2f}",
            })

        return {
            "total_customers": total_customers,
            "company_count": company_count,
            "individual_count": individual_count,
            "top_customers": top_customers,
        }
    except Exception as e:
        logger.error(f"Error in get_customer_summary: {e}")
        return {"error": f"Failed to fetch customer summary: {str(e)}"}
    finally:
        if connection:
            connection.close()


def get_business_overview() -> dict:
    """
    Combines high-level sales, expenses, net recorded performance, customer count,
    low stock count, and sales trend.
    """
    todays_sales = get_todays_sales()
    sales_month = get_sales_summary("month")
    expense_month = get_expense_summary("month")
    perf = get_business_performance()
    low_stock = get_low_stock_products()
    cust_summary = get_customer_summary()
    trends = get_sales_trends("month")

    return {
        "todays_sales": todays_sales.get("total_sales", 0.0),
        "formatted_todays_sales": todays_sales.get("formatted_total_sales", "Rs. 0.00"),
        "monthly_sales": sales_month.get("total_sales", 0.0),
        "formatted_monthly_sales": sales_month.get("formatted_total_sales", "Rs. 0.00"),
        "monthly_expenses": expense_month.get("total_expenses", 0.0),
        "formatted_monthly_expenses": expense_month.get("formatted_total_expenses", "Rs. 0.00"),
        "net_recorded_performance": perf.get("net_recorded_performance", 0.0),
        "formatted_net_performance": perf.get("formatted_net_performance", "Rs. 0.00"),
        "total_customers": cust_summary.get("total_customers", 0),
        "low_stock_count": low_stock.get("low_stock_count", 0),
        "sales_trend_direction": trends.get("direction", "NEUTRAL"),
        "sales_trend_percentage": trends.get("percentage_change", 0.0),
        "limitation_note": LIMITATION_MISSING_COST_PRICE,
    }


def get_business_advisor_insights() -> dict:
    """
    Synthesizes cross-domain data into 3-4 concise, evidence-based actionable business recommendations.
    All calculations, thresholds, and business rules are strictly evaluated in Python.
    Clearly distinguishes recorded cash flow performance from accounting profit.
    """
    perf = get_business_performance()
    expenses = get_expense_summary("all")
    top_products_data = get_top_products(limit=3)
    low_stock_data = get_low_stock_products()
    customer_data = get_customer_summary()
    trends_data = get_sales_trends("month")

    sales = float(perf.get("total_sales", 0.0))
    total_exp = float(perf.get("total_expenses", 0.0))
    net_perf = float(perf.get("net_recorded_performance", 0.0))
    status = perf.get("status", "NEUTRAL")

    exp_cats = expenses.get("categories", [])
    top_prods = top_products_data.get("top_products", [])
    low_stock_items = low_stock_data.get("low_stock_items", [])
    top_customers = customer_data.get("top_customers", [])
    total_customers = int(customer_data.get("total_customers", 0))

    recommendations = []

    # 1. Financial Performance & Cash Flow Recommendation
    if net_perf < 0:
        gap = abs(net_perf)
        recommendations.append(
            f"Cash Flow Control: Recorded operating deficit stands at Rs. {gap:,.2f} "
            f"(Sales: Rs. {sales:,.2f} vs Expenses: Rs. {total_exp:,.2f}). "
            f"Prioritize curbing recurring overhead expenditures while accelerating billable sales."
        )
    else:
        recommendations.append(
            f"Financial Stability: Recorded operating surplus is Rs. {net_perf:,.2f} "
            f"(Sales: Rs. {sales:,.2f} vs Expenses: Rs. {total_exp:,.2f}). "
            f"Reinvest surplus cash strategically into fast-moving inventory and customer expansion."
        )

    # 2. Inventory Supply Risk Recommendation
    if low_stock_items:
        item_names = ", ".join([f"'{it['product_name']}'" for it in low_stock_items[:2]])
        recommendations.append(
            f"Inventory Replenishment: {len(low_stock_items)} product(s) ({item_names}) are at or below reorder level. "
            f"Restock promptly to prevent stockouts and fulfill upcoming customer demand."
        )
    elif top_prods:
        top_p = top_prods[0]
        p_name = top_p["item_name"]
        p_rev = top_p["total_revenue"]
        p_qty = top_p["quantity_sold"]
        prod_share = round((p_rev / sales) * 100, 1) if sales > 0 else 0.0
        recommendations.append(
            f"Product Growth: '{p_name}' leads recorded revenue ({p_qty:g} units sold, Rs. {p_rev:,.2f}, {prod_share}% of sales). "
            f"Bundle or actively promote this offering to capitalize on proven demand."
        )
    else:
        recommendations.append(
            "Product & Inventory Baseline: All stock levels are sufficient with zero products below reorder thresholds. "
            "Focus on issuing initial customer invoices to establish product baseline demand."
        )

    # 3. Expense Optimization Recommendation
    if exp_cats:
        top_cat = exp_cats[0]
        cat_name = top_cat["category"]
        cat_amt = top_cat["amount"]
        cat_pct = top_cat["percentage"]
        recommendations.append(
            f"Expense Optimization: '{cat_name}' represents the largest cost driver at {cat_pct}% "
            f"(Rs. {cat_amt:,.2f}) of total recorded expenses. Audit this category for renegotiation or efficiency gains."
        )
    else:
        recommendations.append(
            "Expense Tracking: No categorized expenses are recorded. Regularly log operating costs to maintain visibility on margins."
        )

    # 4. Customer Concentration & Retention Recommendation
    if top_customers and sales > 0:
        top_c = top_customers[0]
        c_name = top_c["customer_name"]
        c_spent = top_c["total_spent"]
        cust_share = round((c_spent / sales) * 100, 1)
        if cust_share >= 35.0:
            recommendations.append(
                f"Customer Diversification: Top client '{c_name}' accounts for {cust_share}% (Rs. {c_spent:,.2f}) of total sales. "
                f"Maintain strong service for '{c_name}' while actively acquiring new clients to reduce reliance."
            )
        else:
            recommendations.append(
                f"Client Expansion: Base of {total_customers} clients. '{c_name}' is the top contributor at Rs. {c_spent:,.2f}. "
                f"Engage existing individual and corporate clients with targeted follow-ups."
            )
    else:
        recommendations.append(
            f"Customer Pipeline: {total_customers} registered client(s). Initiate proactive client outreach to generate new billable sales."
        )

    return {
        "status": status,
        "total_sales": sales,
        "formatted_total_sales": f"Rs. {sales:,.2f}",
        "total_expenses": total_exp,
        "formatted_total_expenses": f"Rs. {total_exp:,.2f}",
        "net_recorded_performance": round(net_perf, 2),
        "formatted_net_performance": f"Rs. {net_perf:,.2f}",
        "sales_trend_direction": trends_data.get("direction", "NEUTRAL"),
        "sales_trend_percentage": trends_data.get("percentage_change", 0.0),
        "low_stock_count": len(low_stock_items),
        "low_stock_items": [it["product_name"] for it in low_stock_items],
        "top_product_name": top_prods[0]["item_name"] if top_prods else None,
        "top_product_revenue": top_prods[0]["total_revenue"] if top_prods else 0.0,
        "top_expense_category": exp_cats[0]["category"] if exp_cats else None,
        "top_expense_percentage": exp_cats[0]["percentage"] if exp_cats else 0.0,
        "top_customer_name": top_customers[0]["customer_name"] if top_customers else None,
        "total_customers": total_customers,
        "recommendations": recommendations,
        "limitation_note": LIMITATION_MISSING_COST_PRICE,
    }


# Map of available tool functions
TOOL_REGISTRY = {
    "get_todays_sales": get_todays_sales,
    "get_sales_summary": get_sales_summary,
    "get_sales_trends": get_sales_trends,
    "get_expense_summary": get_expense_summary,
    "get_business_performance": get_business_performance,
    "get_top_products": get_top_products,
    "get_low_stock_products": get_low_stock_products,
    "get_customer_summary": get_customer_summary,
    "get_business_overview": get_business_overview,
    "get_business_advisor_insights": get_business_advisor_insights,
}
