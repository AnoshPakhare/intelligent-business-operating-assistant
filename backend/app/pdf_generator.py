import io
from decimal import Decimal
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def format_currency(val):
    if val is None:
        return "Rs. 0.00"
    try:
        num = float(val)
        return f"Rs. {num:,.2f}"
    except (ValueError, TypeError):
        return f"Rs. {val}"

def generate_invoice_pdf(invoice_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    story = []
    styles = getSampleStyleSheet()

    # Custom styles
    company_title_style = ParagraphStyle(
        'CompanyTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1E293B')
    )
    
    company_sub_style = ParagraphStyle(
        'CompanySub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#475569')
    )

    invoice_heading_style = ParagraphStyle(
        'InvoiceHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        alignment=TA_RIGHT,
        textColor=colors.HexColor('#4F46E5')
    )

    invoice_meta_style = ParagraphStyle(
        'InvoiceMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        alignment=TA_RIGHT,
        textColor=colors.HexColor('#334155')
    )

    cancelled_badge_style = ParagraphStyle(
        'CancelledBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        alignment=TA_RIGHT,
        textColor=colors.HexColor('#DC2626')
    )

    section_heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#1E293B')
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )

    body_bold_style = ParagraphStyle(
        'BodyBoldCustom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )

    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    th_right_style = ParagraphStyle(
        'TableHeaderRight',
        parent=th_style,
        alignment=TA_RIGHT
    )

    td_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#1E293B')
    )

    td_right_style = ParagraphStyle(
        'TableCellRight',
        parent=td_style,
        alignment=TA_RIGHT
    )

    totals_label_style = ParagraphStyle(
        'TotalsLabel',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        alignment=TA_RIGHT,
        textColor=colors.HexColor('#475569')
    )

    totals_val_style = ParagraphStyle(
        'TotalsVal',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        alignment=TA_RIGHT,
        textColor=colors.HexColor('#0F172A')
    )

    grand_total_label_style = ParagraphStyle(
        'GrandTotalLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        alignment=TA_RIGHT,
        textColor=colors.HexColor('#4F46E5')
    )

    grand_total_val_style = ParagraphStyle(
        'GrandTotalVal',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        alignment=TA_RIGHT,
        textColor=colors.HexColor('#4F46E5')
    )

    # 1. Header Row (Business Details vs Invoice Heading)
    business_info = [
        Paragraph("IBOA Enterprises", company_title_style),
        Paragraph("101 Tech Park, Commercial Hub, Sector 62", company_sub_style),
        Paragraph("Mumbai, Maharashtra - 400001", company_sub_style),
        Paragraph("Phone: +91 98765 43210 | Email: billing@iboa.ai", company_sub_style),
        Paragraph("GSTIN: 27AAACI1683M1ZI", company_sub_style),
    ]

    is_cancelled = (invoice_data.get('status') == 'CANCELLED')
    
    meta_info = [
        Paragraph("TAX INVOICE", invoice_heading_style),
        Spacer(1, 4),
        Paragraph(f"<b>Invoice #:</b> {invoice_data.get('invoice_number', 'N/A')}", invoice_meta_style),
        Paragraph(f"<b>Date:</b> {invoice_data.get('invoice_date', 'N/A')}", invoice_meta_style),
        Paragraph(f"<b>Status:</b> {invoice_data.get('status', 'CREATED')}", invoice_meta_style),
    ]

    if is_cancelled:
        meta_info.append(Spacer(1, 4))
        meta_info.append(Paragraph("<b>*** INVOICE CANCELLED ***</b>", cancelled_badge_style))

    header_table = Table([[business_info, meta_info]], colWidths=[3.25 * inch, 4.25 * inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 14))

    # Divider line
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#4F46E5'), spaceAfter=14))

    # 2. Customer Details Box
    cust = invoice_data.get('customer', {})
    cust_name = cust.get('name', 'N/A')
    cust_type = cust.get('customer_type', 'N/A')
    cust_addr = cust.get('address', 'N/A')
    cust_phone = cust.get('phone', 'N/A')
    cust_email = cust.get('email', 'N/A') or 'N/A'
    cust_gstin = cust.get('gstin', 'N/A') or 'N/A'

    bill_to_content = [
        Paragraph("BILLED TO", section_heading_style),
        Spacer(1, 3),
        Paragraph(f"<b>{cust_name}</b> ({cust_type})", body_bold_style),
        Paragraph(f"<b>Address:</b> {cust_addr}", body_style),
        Paragraph(f"<b>Phone:</b> {cust_phone} | <b>Email:</b> {cust_email}", body_style),
        Paragraph(f"<b>GSTIN:</b> {cust_gstin}", body_style),
    ]

    bill_to_table = Table([[bill_to_content]], colWidths=[7.5 * inch])
    bill_to_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(bill_to_table)
    story.append(Spacer(1, 16))

    # 3. Items Table
    table_headers = [
        Paragraph("#", th_style),
        Paragraph("Item Description", th_style),
        Paragraph("Qty", th_right_style),
        Paragraph("Unit Price", th_right_style),
        Paragraph("GST %", th_right_style),
        Paragraph("GST Amount", th_right_style),
        Paragraph("Line Total", th_right_style),
    ]

    table_data = [table_headers]
    items = invoice_data.get('items', [])

    for idx, item in enumerate(items, 1):
        item_name = item.get('item_name', 'Item')
        qty = item.get('quantity', 0)
        unit_price = item.get('unit_price', 0)
        gst_rate = item.get('gst_rate', 0)
        gst_amount = item.get('gst_amount', 0)
        line_total = item.get('line_total', 0)

        table_data.append([
            Paragraph(str(idx), td_style),
            Paragraph(item_name, td_style),
            Paragraph(str(qty), td_right_style),
            Paragraph(format_currency(unit_price), td_right_style),
            Paragraph(f"{float(gst_rate):g}%", td_right_style),
            Paragraph(format_currency(gst_amount), td_right_style),
            Paragraph(format_currency(line_total), td_right_style),
        ])

    col_widths = [0.4 * inch, 2.5 * inch, 0.7 * inch, 1.0 * inch, 0.8 * inch, 1.05 * inch, 1.05 * inch]
    items_table = Table(table_data, colWidths=col_widths)

    t_style = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('ALIGN', (0,0), (-1,0), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
    ]

    # Alternating row background
    for i in range(1, len(table_data)):
        if i % 2 == 0:
            t_style.append(('BACKGROUND', (0, i), (-1, i), colors.HexColor('#F8FAFC')))

    items_table.setStyle(TableStyle(t_style))
    story.append(items_table)
    story.append(Spacer(1, 14))

    # 4. Totals Block
    subtotal = invoice_data.get('subtotal', 0)
    discount = invoice_data.get('discount', 0)
    total_gst = invoice_data.get('gst_amount', 0)
    grand_total = invoice_data.get('grand_total', 0)

    totals_rows = [
        [Paragraph("Subtotal:", totals_label_style), Paragraph(format_currency(subtotal), totals_val_style)],
        [Paragraph("Discount:", totals_label_style), Paragraph(f"- {format_currency(discount)}", totals_val_style)],
        [Paragraph("Total GST:", totals_label_style), Paragraph(format_currency(total_gst), totals_val_style)],
        [Paragraph("Grand Total:", grand_total_label_style), Paragraph(format_currency(grand_total), grand_total_val_style)],
    ]

    totals_table = Table(totals_rows, colWidths=[1.8 * inch, 1.4 * inch])
    totals_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('BACKGROUND', (0, 3), (1, 3), colors.HexColor('#EEF2FF')),
        ('BOX', (0, 3), (1, 3), 1, colors.HexColor('#4F46E5')),
        ('PADDING', (0, 3), (1, 3), 6),
    ]))

    # Right align the totals table
    wrapper_table = Table([[Paragraph("", body_style), totals_table]], colWidths=[4.3 * inch, 3.2 * inch])
    wrapper_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(wrapper_table)
    story.append(Spacer(1, 24))

    # 5. Footer & Terms
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#CBD5E1'), spaceAfter=10))
    footer_text = Paragraph(
        "<b>Terms & Conditions:</b> Payment is due within 15 days of invoice date. "
        "This is a computer-generated tax invoice and requires no physical signature.",
        company_sub_style
    )
    story.append(footer_text)

    # Build PDF
    doc.build(story)
    pdf_data = buffer.getvalue()
    buffer.close()
    return pdf_data
