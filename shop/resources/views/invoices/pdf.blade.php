<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
        }
        
        .header {
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .company-info {
            text-align: left;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .company-details {
            font-size: 10px;
            color: #666;
        }
        
        .invoice-title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin: 30px 0;
            text-transform: uppercase;
        }
        
        .invoice-details {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        
        .invoice-from,
        .invoice-to {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 0 10px;
        }
        
        .invoice-from {
            padding-left: 0;
        }
        
        .invoice-to {
            padding-right: 0;
        }
        
        .section-title {
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 3px;
        }
        
        .detail-row {
            margin-bottom: 3px;
        }
        
        .work-details {
            margin-bottom: 30px;
        }
        
        .motorcycle-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .services-table th,
        .services-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .services-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            border-bottom: 2px solid #333;
        }
        
        .services-table .text-right {
            text-align: right;
        }
        
        .totals {
            width: 300px;
            margin-left: auto;
            margin-bottom: 30px;
        }
        
        .totals table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .totals td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        
        .totals .total-label {
            font-weight: bold;
            text-align: right;
            width: 60%;
        }
        
        .totals .total-amount {
            text-align: right;
            width: 40%;
        }
        
        .totals .grand-total {
            font-size: 14px;
            font-weight: bold;
            border-top: 2px solid #333;
            border-bottom: 2px solid #333;
        }
        
        .payment-info {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 10px;
            color: #666;
        }
        
        .footer {
            position: absolute;
            bottom: 30px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 9px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-paid {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .status-overdue {
            background-color: #f8d7da;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <div class="company-name">Motorcycle Repair Shop</div>
            <div class="company-details">
                Professional Motorcycle Services & Parts<br>
                Via Example 123, 12345 City, Italy<br>
                Phone: +39 123 456 7890 | Email: info@motorcycleshop.com<br>
                P.IVA: IT12345678901
            </div>
        </div>
    </div>

    <div class="invoice-title">Invoice / Fattura</div>

    <div class="invoice-details">
        <div class="invoice-from">
            <div class="section-title">Invoice Details</div>
            <div class="detail-row"><strong>Invoice #:</strong> {{ $invoice->invoice_number }}</div>
            <div class="detail-row"><strong>Issue Date:</strong> {{ $invoice->issue_date->format('d/m/Y') }}</div>
            <div class="detail-row"><strong>Due Date:</strong> {{ $invoice->due_date->format('d/m/Y') }}</div>
            <div class="detail-row">
                <strong>Status:</strong> 
                <span class="status-badge status-{{ $invoice->status }}">{{ ucfirst($invoice->status) }}</span>
            </div>
            @if($invoice->paid_at)
                <div class="detail-row"><strong>Paid Date:</strong> {{ $invoice->paid_at->format('d/m/Y') }}</div>
            @endif
        </div>
        
        <div class="invoice-to">
            <div class="section-title">Bill To / Fatturato a</div>
            <div class="detail-row"><strong>{{ $user->first_name }} {{ $user->last_name }}</strong></div>
            @if($user->tax_code)
                <div class="detail-row">Tax Code: {{ $user->tax_code }}</div>
            @endif
            <div class="detail-row">Email: {{ $user->email }}</div>
            @if($user->phone)
                <div class="detail-row">Phone: {{ $user->phone }}</div>
            @endif
        </div>
    </div>

    <div class="work-details">
        <div class="motorcycle-info">
            <div class="section-title">Motorcycle Details / Dettagli Motociclo</div>
            <div class="detail-row"><strong>Make & Model:</strong> {{ $motorcycle->motorcycleModel->brand }} {{ $motorcycle->motorcycleModel->name }}</div>
            <div class="detail-row"><strong>Year:</strong> {{ $motorcycle->registration_year }}</div>
            <div class="detail-row"><strong>License Plate:</strong> {{ $motorcycle->license_plate }}</div>
            @if($motorcycle->vin)
                <div class="detail-row"><strong>VIN:</strong> {{ $motorcycle->vin }}</div>
            @endif
        </div>

        <div class="section-title">Work Description / Descrizione Lavoro</div>
        <p style="margin-bottom: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 3px;">
            {{ $workOrder->description }}
        </p>
    </div>

    <table class="services-table">
        <thead>
            <tr>
                <th>Description / Descrizione</th>
                <th>Qty / Qtà</th>
                <th class="text-right">Unit Price / Prezzo Unitario</th>
                <th class="text-right">Total / Totale</th>
            </tr>
        </thead>
        <tbody>
            <!-- Labor costs -->
            @if($workOrder->labor_cost > 0)
                <tr>
                    <td>Labor / Manodopera</td>
                    <td>1</td>
                    <td class="text-right">€{{ number_format($workOrder->labor_cost, 2) }}</td>
                    <td class="text-right">€{{ number_format($workOrder->labor_cost, 2) }}</td>
                </tr>
            @endif
            
            <!-- Parts -->
            @foreach($parts as $part)
                <tr>
                    <td>{{ $part->name }}</td>
                    <td>{{ $part->pivot->quantity }}</td>
                    <td class="text-right">€{{ number_format($part->pivot->unit_price, 2) }}</td>
                    <td class="text-right">€{{ number_format($part->pivot->total_price, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td class="total-label">Subtotal / Subtotale:</td>
                <td class="total-amount">€{{ number_format($invoice->subtotal, 2) }}</td>
            </tr>
            <tr>
                <td class="total-label">VAT 22% / IVA 22%:</td>
                <td class="total-amount">€{{ number_format($invoice->tax_amount, 2) }}</td>
            </tr>
            <tr class="grand-total">
                <td class="total-label">Total / Totale:</td>
                <td class="total-amount">€{{ number_format($invoice->total_amount, 2) }}</td>
            </tr>
        </table>
    </div>

    <div class="payment-info">
        <div class="section-title">Payment Information / Informazioni di Pagamento</div>
        <p>Payment due within 30 days from issue date. / Pagamento dovuto entro 30 giorni dalla data di emissione.</p>
        @if($invoice->status === 'paid')
            <p><strong>This invoice has been paid. / Questa fattura è stata pagata.</strong></p>
        @elseif($invoice->status === 'overdue')
            <p style="color: #d32f2f;"><strong>This invoice is overdue. / Questa fattura è scaduta.</strong></p>
        @endif
    </div>

    <div class="footer">
        Thank you for choosing our services! / Grazie per aver scelto i nostri servizi!<br>
        Generated on {{ now()->format('d/m/Y H:i') }}
    </div>
</body>
</html> 