import React from 'react';
import { X, Printer, Download, CheckCircle, FileText, Send, Landmark, ReceiptText } from 'lucide-react';
import { Order } from '../types';
import { formatBDT } from '../utils';

interface InvoiceModalProps {
  order: Order;
  language: 'en' | 'bn';
  onClose: () => void;
  siteConfigs?: any;
}

export default function InvoiceModal({ order, language, onClose, siteConfigs }: InvoiceModalProps) {
  const isPaid = order.paymentStatus === 'Paid';

  const webNameEn = siteConfigs?.websiteNameEN || 'AmarBazar';
  const webNameBn = siteConfigs?.websiteNameBN || 'আমারবাজার';
  const displayWebName = language === 'en' ? webNameEn : webNameBn;
  const lowercaseSimpleName = webNameEn.toLowerCase().replace(/\s+/g, '');

  const t = {
    title: language === 'en' ? 'Official Tax Invoice' : 'অফিসিয়াল ইনভয়েস / ক্রয়ের রসিদ',
    invoiceNo: language === 'en' ? 'Invoice No:' : 'রসিদ নম্বর:',
    orderDate: language === 'en' ? 'Order Date:' : 'অর্ডারের তারিখ:',
    billFrom: language === 'en' ? 'Seller Info:' : 'বিক্রেতার তথ্য:',
    billTo: language === 'en' ? 'Billing & Delivery To:' : 'ক্রেতা ও ডেলিভারি তথ্য:',
    desc: language === 'en' ? 'Item Details' : 'পণ্যের বিবরণ',
    qty: language === 'en' ? 'Qty' : 'পরিমাণ',
    price: language === 'en' ? 'Unit Price' : 'একক মূল্য',
    subTotal: language === 'en' ? 'Subtotal' : 'সাবটোটাল',
    delivery: language === 'en' ? 'Delivery Charge' : 'ডেলিভারি চার্জ',
    grandTotal: language === 'en' ? 'Grand Total' : 'সর্বমোট প্রদেয়',
    paymentMethod: language === 'en' ? 'Payment Method:' : 'পেমেন্ট ধরণ:',
    paymentStatus: language === 'en' ? 'Payment Status:' : 'পেমেন্ট অবস্থা:',
    paid: language === 'en' ? 'PAID / পরিশোধিত' : 'PAID / পরিশোধিত',
    unpaid: language === 'en' ? 'CASH ON DELIVERY (Pending)' : 'ক্যাশ অন ডেলিভারি (বাকি)',
    verifiedInvoice: language === 'en' ? 'Verified Digital Invoice' : 'অনলাইন ভেরিফাইড ডিজিটাল রসিদ',
    supportText: language === 'en' 
      ? `For queries, mail us at support@${lowercaseSimpleName}.com or dial ${siteConfigs?.hotline || '+880 9612-345678'}.` 
      : `যেকোনো জিজ্ঞাসায় মেল করুন support@${lowercaseSimpleName}.com অথবা কল করুন ${siteConfigs?.hotline || '+৮৮০ ৯৬১২-৩৪৫৬৭৮'} নম্বরে।`,
    downloadBtn: language === 'en' ? 'Download Offline Invoice' : 'অফলাইন রসিদ ডাউনলোড',
    printBtn: language === 'en' ? 'Print / Save PDF' : 'পিন্ট করুন / সেভ PDF',
    closeBtn: language === 'en' ? 'Close Window' : 'উইন্ডো বন্ধ করুন',
    companyName: displayWebName + (language === 'en' ? ' Premium Ltd.' : ' প্রিমিয়াম লিমিটেড'),
    companyAddress: siteConfigs?.footerAddress || 'Sector 4, Uttara, Dhaka-1230',
    vatNo: 'VAT Registration No: 1948291048-BD',
    barcodeText: `${webNameEn.toUpperCase().replace(/[^A-Z0-9]/gi, '')}-SECURE-ID-${order.id}`,
    tyName: language === 'en' ? 'Thank You!' : 'ধন্যবাদ আমাদের সাথে থাকার জন্য!',
    authorizedSign: language === 'en' ? 'Authorized Seal' : 'কর্তৃপক্ষের অনুমোদন'
  };

  // Pre-calculate subtotal
  const orderSubTotal = order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const orderDeliveryCharge = order.total - orderSubTotal;

  // Handle direct offline HTML file builder download
  const handleDownloadInvoiceHTML = () => {
    const itemRowsHTML = order.items.map(item => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 12px 8px; font-size: 13px; color: #1E293B;">
          <strong>${language === 'en' ? item.product.title : item.product.banglaTitle}</strong>
          ${item.selectedSize ? `<br/><span style="font-size: 11px; color: #64748B;">Size: ${item.selectedSize}</span>` : ''}
          ${item.selectedColor ? `<br/><span style="font-size: 11px; color: #64748B;">Color: ${item.selectedColor}</span>` : ''}
        </td>
        <td style="padding: 12px 8px; font-size: 13px; text-align: center; color: #1E293B;">${item.quantity}</td>
        <td style="padding: 12px 8px; font-size: 13px; text-align: right; color: #1E293B; font-family: monospace;">${formatBDT(item.product.price, language)}</td>
        <td style="padding: 12px 8px; font-size: 13px; text-align: right; color: #16A34A; font-family: monospace; font-weight: bold;">${formatBDT(item.product.price * item.quantity, language)}</td>
      </tr>
    `).join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <title>Invoice-${order.id}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 40px 20px; }
    .invoice-card { max-w: 800px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); position: relative; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .subtitle { font-size: 12px; color: #16A34A; font-weight: 700; margin: 0; letter-spacing: 1px; }
    .company-details { font-size: 12px; color: #64748B; text-align: right; line-height: 1.5; }
    .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; padding: 20px 0; }
    .info-col { width: 48%; }
    .info-label { font-size: 11px; text-transform: uppercase; font-weight: 800; color: #94A3B8; margin-bottom: 5px; }
    .info-val { font-size: 13px; color: #1E293B; line-height: 1.5; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .items-table th { background: #F1F5F9; padding: 12px 8px; font-size: 11px; text-transform: uppercase; font-weight: 800; color: #475569; text-align: left; }
    .summary-box { float: right; width: 300px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 15px; margin-bottom: 30px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #475569; }
    .summary-row.total { border-top: 1px solid #E2E8F0; padding-top: 8px; font-weight: 800; color: #0F172A; font-size: 15px; }
    .seal { border: 3px dashed ${isPaid ? '#16A34A' : '#D97706'}; color: ${isPaid ? '#16A34A' : '#D97706'}; font-weight: 900; font-size: 12px; padding: 6px 15px; display: inline-block; transform: rotate(-5deg); border-radius: 8px; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 10px; }
    .footer { font-size: 11px; text-align: center; color: #94A3B8; margin-top: 60px; line-height: 1.5; border-t: 1px solid #E2E8F0; padding-top: 20px; }
    .print-btn-no { background: #16A34A; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; display: inline-block; margin-bottom: 20px; text-decoration: none; font-size: 13px; }
    @media print { .print-btn-no { display: none; } body { background: white; padding: 0; } .invoice-card { border: none; box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div style="text-align: center;">
    <button class="print-btn-no" onclick="window.print()">${t.printBtn}</button>
  </div>
  <div class="invoice-card">
    <table class="header-table">
      <tr>
        <td style="vertical-align: top;">
          <h1 class="title">${t.companyName}</h1>
          <p class="subtitle">${t.title}</p>
        </td>
        <td class="company-details" style="vertical-align: top;">
          <strong>${displayWebName} HQ</strong><br/>
          \${t.companyAddress}<br/>
          \${t.vatNo}<br/>
          Email: support@\${lowercaseSimpleName}.com
        </td>
      </tr>
    </table>

    <div class="info-grid">
      <div class="info-col">
        <div class="info-label">${t.invoiceNo}</div>
        <div class="info-val" style="font-weight: 700; font-family: monospace; color: #16A34A; font-size: 15px;">${order.id}</div>
        <div style="height: 10px;"></div>
        <div class="info-label">${t.orderDate}</div>
        <div class="info-val">${order.date}</div>
        <div style="height: 10px;"></div>
        <div class="info-label">${t.paymentMethod}</div>
        <div class="info-val">${order.paymentMethod} (${isPaid ? 'PAID' : 'COD'})</div>
      </div>
      <div class="info-col">
        <div class="info-label">${t.billTo}</div>
        <div class="info-val">
          <strong>${order.shippingAddress.name}</strong><br/>
          📞 ${order.shippingAddress.phone}<br/>
          📍 ${order.shippingAddress.address}<br/>
          District: ${order.shippingAddress.district}
        </div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>${t.desc}</th>
          <th style="text-align: center; width: 60px;">${t.qty}</th>
          <th style="text-align: right; width: 120px;">${t.price}</th>
          <th style="text-align: right; width: 120px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsHTML}
      </tbody>
    </table>

    <div style="overflow: hidden; width: 100%;">
      <div style="float: left; width: 40%;">
        <div class="seal">${isPaid ? 'SECURED / PAID' : 'CASH ON DELIVERY / COD'}</div>
        <div style="margin-top: 15px; font-size: 11px; color: #94A3B8; font-family: monospace;">${t.barcodeText}</div>
      </div>
      <div class="summary-box">
        <div class="summary-row">
          <span>${t.subTotal}</span>
          <span>${formatBDT(orderSubTotal, language)}</span>
        </div>
        <div class="summary-row">
          <span>${t.delivery}</span>
          <span>${orderDeliveryCharge === 0 ? 'FREE' : formatBDT(orderDeliveryCharge, language)}</span>
        </div>
        <div class="summary-row total">
          <span>${t.grandTotal}</span>
          <span style="color: #16A34A;">${formatBDT(order.total, language)}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      ${t.tyName}<br/>
      ${t.supportText}
    </div>
  </div>
</body>
</html>
    `;

    // Trigger file download standard mechanism
    const element = document.createElement('a');
    const file = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Invoice-${order.id}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    // Trigger standard print system
    window.print();
  };

  return (
    <div 
      id={`invoice-modal-overlay-${order.id}`}
      className="fixed inset-0 z-[100] bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <style>{`
        @media print {
          /* Hide scrollbars & page settings artifacts */
          html, body {
            height: auto !important;
            overflow: visible !important;
            background-color: #FFFFFF !important;
          }
          /* Ensure everything else on screen is hidden completely */
          body * {
            visibility: hidden !important;
          }
          /* Selectively make the print sheet workspace and its kids visible */
          #invoice-print-area, #invoice-print-area * {
            visibility: visible !important;
          }
          /* Absolute layout for printer spacing */
          #invoice-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Hide non-invoice overlays, backdrops, modal container, etc */
          .fixed, [id^="invoice-modal-overlay"] {
            background-color: transparent !important;
            position: relative !important;
          }
          [id^="invoice-modal-overlay"] > div {
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
          }
        }
      `}</style>
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col my-8 select-none">
        
        {/* Top Control Bar */}
        <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black uppercase tracking-wider font-sans">
              {t.title}
            </h3>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-350 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Primary Workspace */}
        <div 
          id="invoice-print-area"
          className="p-6 md:p-8 flex flex-col gap-6 text-left max-h-[70vh] overflow-y-auto font-sans"
        >
          
          {/* Company Brand Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">
                {t.companyName}
              </h2>
              <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest block font-sans">
                {t.verifiedInvoice}
              </span>
              <p className="text-[11px] text-slate-500 mt-2 max-w-xs leading-relaxed">
                {t.companyAddress}
              </p>
            </div>
            
            <div className="sm:text-right text-[11px] text-slate-500 leading-normal">
              <strong>{displayWebName} HQ Central</strong><br/>
              {t.vatNo}<br/>
              Email: support@{lowercaseSimpleName}.com
            </div>
          </div>

          {/* Transaction metadata blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
            <div className="text-xs space-y-2">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">{t.invoiceNo}</span>
                <span className="font-mono text-sm font-black text-[#16A34A]">{order.id}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">{t.orderDate}</span>
                <span className="font-medium text-slate-700">{order.date}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">{t.paymentMethod}</span>
                <span className="font-bold text-slate-800 capitalize">{order.paymentMethod}</span>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">{t.billTo}</span>
              <p className="font-bold text-slate-800 text-sm leading-tight mb-1">{order.shippingAddress.name}</p>
              <p className="text-slate-650 flex items-center gap-1">📞 <span className="font-mono">{order.shippingAddress.phone}</span></p>
              <p className="text-slate-600 font-sans tracking-tight leading-tight">📍 {order.shippingAddress.address}</p>
              <span className="inline-block bg-slate-200 text-slate-750 font-black px-2 py-0.5 rounded text-[10px] uppercase font-mono mt-1">
                {order.shippingAddress.district}
              </span>
            </div>
          </div>

          {/* Itemized shopping entries */}
          <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-inner">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase select-none text-[10px]">
                  <th className="py-2.5 px-4">{t.desc}</th>
                  <th className="py-2.5 px-4 text-center">{t.qty}</th>
                  <th className="py-2.5 px-4 text-right">{t.price}</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-800">
                      <div className="font-bold leading-snug">
                        {language === 'en' ? item.product.title : item.product.banglaTitle}
                      </div>
                      <div className="flex gap-2.5 text-[10px] text-slate-450 mt-1 font-semibold leading-none">
                        {item.selectedSize && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded">Size: {item.selectedSize}</span>
                        )}
                        {item.selectedColor && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded">Color: {item.selectedColor}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {language === 'bn' ? item.quantity.toLocaleString('bn') : item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {formatBDT(item.product.price, language)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-950">
                      {formatBDT(item.product.price * item.quantity, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & stamp block split */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-100 pt-5">
            {/* Stamp validation info */}
            <div className="text-left">
              <div className="inline-block relative">
                {isPaid ? (
                  <div className="border-2 border-dashed border-emerald-500 rounded-xl px-4 py-2 text-[11px] font-black tracking-widest text-emerald-600 uppercase font-mono transform rotate-[-2deg] select-none bg-emerald-50/50">
                    🏆 SECURED / PAID
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-amber-600 rounded-xl px-4 py-2 text-[11px] font-black tracking-widest text-amber-700 uppercase font-mono transform rotate-[-2deg] select-none bg-amber-50/50">
                    🚚 CASH ON DELIVERY
                  </div>
                )}
              </div>
              
              {/* Fake barcode block */}
              <div className="mt-4 flex flex-col gap-1">
                <span className="h-6 w-44 bg-repeating-linear border-l border-slate-700 block filter opacity-80" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #334155, #334155 2px, transparent 2px, transparent 6px)' }}></span>
                <span className="text-[10px] font-mono text-slate-400 font-bold tracking-widest lowercase">
                  {t.barcodeText}
                </span>
              </div>
            </div>

            {/* Price additions summaries */}
            <div className="w-full sm:w-64 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between text-slate-500 font-semibold">
                <span>{t.subTotal}</span>
                <span className="font-mono text-slate-700">{formatBDT(orderSubTotal, language)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-semibold">
                <span>{t.delivery}</span>
                <span className="font-mono text-slate-700">
                  {orderDeliveryCharge === 0 ? 'FREE' : formatBDT(orderDeliveryCharge, language)}
                </span>
              </div>
              <div className="border-t border-slate-200 my-1"></div>
              <div className="flex justify-between font-black text-sm text-slate-900">
                <span>{t.grandTotal}</span>
                <span className="font-mono text-[#16A34A] text-base">
                  {formatBDT(order.total, language)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400 border-t border-slate-100 pt-4 mt-2">
            <span className="font-bold text-slate-650 block mb-1">{t.tyName}</span>
            <span>{t.supportText}</span>
          </div>

        </div>

        {/* Interactive Action Bottom Bar */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-150 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          
          <button
            id={`btn-download-html-${order.id}`}
            onClick={handleDownloadInvoiceHTML}
            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-[#16A34A] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadBtn}</span>
          </button>

          <button
            id={`btn-print-${order.id}`}
            onClick={handlePrint}
            className="bg-[#16A34A] hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md shadow-emerald-100 hover:shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printBtn}</span>
          </button>

          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>

      </div>
    </div>
  );
}
