import zlib
import base64
from app.main import get_invoices, get_invoice_detail, get_invoice_pdf

def test_pdf_comprehensive():
    print("=== 1. Fetching Invoices from PostgreSQL Database ===")
    invoices = get_invoices()
    
    print(f"Total Invoices in DB: {len(invoices)}")
    assert len(invoices) > 0, "No invoices found in database."

    active_invoices = [i for i in invoices if i['status'] == 'CREATED']
    cancelled_invoices = [i for i in invoices if i['status'] == 'CANCELLED']

    assert len(active_invoices) > 0, "At least one active (CREATED) invoice expected."
    assert len(cancelled_invoices) > 0, "At least one CANCELLED invoice expected."

    # Test 1: First Active Invoice
    inv1 = active_invoices[0]
    print(f"\n=== 2. Testing PDF Endpoint for Active Invoice #{inv1['invoice_id']} ({inv1['invoice_number']}) ===")
    response = get_invoice_pdf(inv1['invoice_id'])
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert response.media_type == "application/pdf"
    disp = response.headers.get("Content-Disposition")
    print(f"Content-Disposition: {disp}")
    safe_num = str(inv1['invoice_number']).replace('/', '_').replace('\\', '_')
    assert safe_num in disp, f"Expected safe invoice number {safe_num} in header {disp}"

    pdf_bytes_1 = response.body
    print(f"Generated PDF Size: {len(pdf_bytes_1)} bytes")
    assert len(pdf_bytes_1) > 1000, "PDF bytes should be non-trivial size"
    assert pdf_bytes_1.startswith(b'%PDF-'), "File does not start with PDF magic bytes %PDF-"
    print("PASS: First Active Invoice PDF successfully generated and verified.")

    # Test 2: Second Active Invoice (if available)
    if len(active_invoices) > 1:
        inv2 = active_invoices[1]
        print(f"\n=== 3. Testing PDF Endpoint for Second Active Invoice #{inv2['invoice_id']} ({inv2['invoice_number']}) ===")
        response_2 = get_invoice_pdf(inv2['invoice_id'])
        assert response_2.status_code == 200
        pdf_bytes_2 = response_2.body
        assert len(pdf_bytes_2) > 1000
        assert pdf_bytes_2.startswith(b'%PDF-')
        print("PASS: Second Active Invoice PDF successfully generated and verified.")

    # Test 3: Cancelled Invoice PDF Verification
    inv_c = cancelled_invoices[0]
    print(f"\n=== 4. Testing PDF Endpoint for Cancelled Invoice #{inv_c['invoice_id']} ({inv_c['invoice_number']}) ===")
    response_c = get_invoice_pdf(inv_c['invoice_id'])
    assert response_c.status_code == 200
    pdf_bytes_c = response_c.body
    print(f"Generated Cancelled PDF Size: {len(pdf_bytes_c)} bytes")
    assert pdf_bytes_c.startswith(b'%PDF-')

    # Verify CANCELLED badge is embedded in PDF stream
    found_cancelled = False
    s_idx = pdf_bytes_c.find(b'\nstream\n')
    if s_idx != -1:
        s_pos = s_idx + 8
        e_pos = pdf_bytes_c.find(b'~>', s_pos) + 2
        raw_stream = pdf_bytes_c[s_pos:e_pos]
        try:
            a85 = base64.a85decode(b'<~' + raw_stream, adobe=True)
            decompressed = zlib.decompress(a85)
            if b"CANCELLED" in decompressed:
                found_cancelled = True
        except Exception as err:
            print(f"Decompress error: {err}")

    print(f"Decompressed stream check for CANCELLED badge: {found_cancelled}")
    assert found_cancelled, "CANCELLED status badge text must be present in PDF stream."
    print("PASS: Cancelled Invoice PDF badge text ('CANCELLED') verified in stream.")

    # Test 4: Content integrity check for customer & items
    print(f"\n=== 5. Verifying Data Consistency for Invoice #{inv1['invoice_id']} ===")
    detail = get_invoice_detail(inv1['invoice_id'])
    assert detail['invoice_number'] == inv1['invoice_number']
    assert 'customer' in detail and detail['customer']['name']
    assert 'items' in detail and len(detail['items']) > 0
    print(f"Customer Name: {detail['customer']['name']}")
    print(f"Line Items Count: {len(detail['items'])}")
    print(f"Grand Total: Rs. {detail['grand_total']}")
    print("PASS: Invoice data consistency verified.")

    print("\n=== ALL COMPREHENSIVE PDF TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_pdf_comprehensive()

