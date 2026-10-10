import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

import { numberToPersianWordsWithRial } from '@/utils/numbers/number-to-persian-words'

// Type augmentation for jsPDF to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable
    lastAutoTable: {
      finalY: number
    }
  }
}

export interface ReceiptProduct {
  name: string
  unitInBox: number
  retailPrice: number
  quantity: number
  discountAmount: number
  netPrice: number
  totalNetPrice: number
  vat: number // VAT percentage (0-100)
}

export interface ReceiptData {
  orderId: number
  createdAt: string
  customerName: string
  customerId?: number | null
  mobileNumber: string
  nationalCode: string | null
  address: string
  postalCode: string | null
  proofOfDeliveryCode: string | null
  products: ReceiptProduct[]
  totalProductsPrice: number
  totalDiscountAmount: number
  netDeliveryFee: number
  netTotal: number
  giftWalletDeduction?: number
}

// Cached font base64 strings (avoids re-fetching, but still registers on each new doc)
let cachedRegularBase64: string | null = null
let cachedBoldBase64: string | null = null

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i])
  }
  return btoa(binary)
}

// Helper function to format number with Persian digits
function toPersianDigits(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)])
}

// Format currency with Persian digits
function formatCurrency(amount: number): string {
  return toPersianDigits(amount.toLocaleString('fa-IR'))
}

// Load Persian font from local assets (both Regular and Bold variants)
async function loadPersianFont(doc: jsPDF): Promise<void> {
  try {
    if (!cachedRegularBase64 || !cachedBoldBase64) {
      const [regularResponse, boldResponse] = await Promise.all([
        fetch('/fonts/Vazirmatn-Regular.ttf'),
        fetch('/fonts/Vazirmatn-Bold.ttf'),
      ])

      const [regularBuffer, boldBuffer] = await Promise.all([
        regularResponse.arrayBuffer(),
        boldResponse.arrayBuffer(),
      ])

      cachedRegularBase64 = arrayBufferToBase64(regularBuffer)
      cachedBoldBase64 = arrayBufferToBase64(boldBuffer)
    }

    // Always register on the current doc instance
    doc.addFileToVFS('Vazirmatn-Regular.ttf', cachedRegularBase64)
    doc.addFileToVFS('Vazirmatn-Bold.ttf', cachedBoldBase64)
    doc.addFont('Vazirmatn-Regular.ttf', 'Vazirmatn', 'normal')
    doc.addFont('Vazirmatn-Bold.ttf', 'Vazirmatn', 'bold')
    doc.setFont('Vazirmatn')
  } catch (error) {
    console.error('Failed to load Persian font:', error)
    doc.setFont('helvetica')
  }
}

export async function generateDeliveryReceipt(
  data: ReceiptData,
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  // Load Persian font
  await loadPersianFont(doc)

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10
  const bottomMargin = 15
  let yPos = 20

  // === HEADER ===
  doc.setFontSize(16)
  const title = 'رسید تحویل بار'
  doc.text(title, pageWidth - margin, yPos, { align: 'right' })
  yPos += 8

  // Order ID and Date
  doc.setFontSize(10)
  const orderIdText = `شماره سفارش: ${toPersianDigits(data.orderId)}`
  doc.text(orderIdText, pageWidth - margin, yPos, { align: 'right' })

  const dateText = `تاریخ: ${new Date(data.createdAt).toLocaleDateString('fa-IR')}`
  doc.text(dateText, margin, yPos)
  yPos += 10

  // Horizontal line
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8

  // === CUSTOMER INFO ===
  doc.setFontSize(12)
  doc.text('اطلاعات مشتری', pageWidth - margin, yPos, { align: 'right' })
  yPos += 7

  doc.setFontSize(10)

  // Customer Name
  const customerNameText = `نام مشتری: ${data.customerName}`
  doc.text(customerNameText, pageWidth - margin, yPos, { align: 'right' })
  yPos += 6

  // Customer ID (Buyer Code)
  if (data.customerId) {
    const customerIdText = `کد خریدار: ${toPersianDigits(data.customerId)}`
    doc.text(customerIdText, pageWidth - margin, yPos, { align: 'right' })
    yPos += 6
  }

  // Mobile Number
  const mobileText = `شماره تماس: ${data.mobileNumber}`
  doc.text(mobileText, pageWidth - margin, yPos, { align: 'right' })
  yPos += 6

  // National Code
  if (data.nationalCode) {
    const nationalCodeText = `کد ملی: ${toPersianDigits(data.nationalCode)}`
    doc.text(nationalCodeText, pageWidth - margin, yPos, { align: 'right' })
    yPos += 6
  }

  // Address
  const addressText = `آدرس: ${data.address}`
  // Word wrap for long addresses
  const maxWidth = pageWidth - margin * 2
  const addressLines = doc.splitTextToSize(addressText, maxWidth)
  for (let i = 0; i < addressLines.length; i++) {
    doc.text(addressLines[i], pageWidth - margin, yPos, { align: 'right' })
    yPos += 5
  }
  yPos += 1

  // Postal Code
  if (data.postalCode) {
    const postalCodeText = `کد پستی: ${toPersianDigits(data.postalCode)}`
    doc.text(postalCodeText, pageWidth - margin, yPos, { align: 'right' })
    yPos += 6
  }

  // Delivery Code
  if (data.proofOfDeliveryCode) {
    const deliveryCodeText = `کد تحویل: ${data.proofOfDeliveryCode}`
    doc.text(deliveryCodeText, pageWidth - margin, yPos, { align: 'right' })
    yPos += 6
  }

  yPos += 4

  // Horizontal line
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8

  // === PRODUCTS TABLE ===
  doc.setFontSize(12)
  doc.text('محصولات', pageWidth - margin, yPos, { align: 'right' })
  yPos += 7

  // Prepare table data
  const tableHead = [
    [
      'جمع کل',
      'مالیات',
      'مبلغ بدون مالیات',
      'فی نهایی هر کارتن',
      'تخفیف هر کارتن',
      'فی کارتن بدون مالیات',
      'تعداد کارتن',
      'فی هر قوطی',
      'تعداد در کارتن',
      'شرح کالا',
      'ردیف',
    ],
  ]

  const tableBody = data.products.map((product, index) => {
    const vatMultiplier = 1 + product.vat / 100

    // Formula calculations (VAT-exclusive prices)
    const boxPriceNoVat = product.retailPrice / vatMultiplier
    const pricePerUnit = boxPriceNoVat / product.unitInBox
    const discountPerBox =
      (product.retailPrice - product.netPrice) / vatMultiplier
    const finalBoxPrice = product.netPrice / vatMultiplier
    const amountWithoutVat = finalBoxPrice * product.quantity
    const vatAmount = amountWithoutVat * (product.vat / 100)
    const grandTotal = amountWithoutVat + vatAmount

    return [
      formatCurrency(Math.round(grandTotal)),
      formatCurrency(Math.round(vatAmount)),
      formatCurrency(Math.round(amountWithoutVat)),
      formatCurrency(Math.round(finalBoxPrice)),
      formatCurrency(Math.round(discountPerBox)),
      formatCurrency(Math.round(boxPriceNoVat)),
      toPersianDigits(product.quantity),
      formatCurrency(Math.round(pricePerUnit)),
      toPersianDigits(product.unitInBox),
      product.name,
      toPersianDigits(index + 1),
    ]
  })

  // Draw table using autoTable
  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: yPos,
    margin: { left: margin, right: margin },
    styles: {
      font: 'Vazirmatn',
      fontSize: 7,
      cellPadding: 2,
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      font: 'Vazirmatn',
      fontStyle: 'bold',
      fontSize: 6,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 22 }, // جمع کل
      1: { cellWidth: 18 }, // مالیات
      2: { cellWidth: 22 }, // مبلغ بدون مالیات
      3: { cellWidth: 20 }, // فی نهایی هر کارتن
      4: { cellWidth: 18 }, // تخفیف هر کارتن
      5: { cellWidth: 22 }, // فی کارتن بدون مالیات
      6: { cellWidth: 14 }, // تعداد کارتن
      7: { cellWidth: 18 }, // فی هر قوطی
      8: { cellWidth: 14 }, // تعداد در کارتن
      9: { cellWidth: 'auto', halign: 'right' }, // شرح کالا (~99mm available)
      10: { cellWidth: 10, halign: 'center' }, // ردیف
    },
  })

  yPos = doc.lastAutoTable.finalY + 10

  // Ensure the whole summary block fits; otherwise paginate so the last line
  // (especially the wrapped "به حروف" text) is never clipped at the page bottom.
  const estimatedSummaryHeight = 60
  if (yPos + estimatedSummaryHeight > pageHeight - bottomMargin) {
    doc.addPage()
    yPos = 20
  }

  // Horizontal line
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8

  // === SUMMARY ===
  doc.setFontSize(12)
  doc.text('خلاصه پرداخت', pageWidth - margin, yPos, { align: 'right' })
  yPos += 7

  doc.setFontSize(10)

  // Total products price
  const totalProductsText = `جمع کل محصولات: ${formatCurrency(data.totalProductsPrice)} ریال`
  doc.text(totalProductsText, pageWidth - margin, yPos, { align: 'right' })
  yPos += 6

  // Total discount
  const totalDiscountText = `تخفیف: ${formatCurrency(data.totalDiscountAmount)} ریال`
  doc.text(totalDiscountText, pageWidth - margin, yPos, { align: 'right' })
  yPos += 6

  // Delivery fee
  const deliveryFeeText = `هزینه ارسال: ${formatCurrency(data.netDeliveryFee)} ریال`
  doc.text(deliveryFeeText, pageWidth - margin, yPos, { align: 'right' })
  yPos += 6

  // Gift wallet usage (only when the customer actually used the gift wallet)
  if (data.giftWalletDeduction && data.giftWalletDeduction > 0) {
    const giftWalletText = `میزان استفاده از کیف پول هدیه: ${formatCurrency(data.giftWalletDeduction)} ریال`
    doc.text(giftWalletText, pageWidth - margin, yPos, { align: 'right' })
    yPos += 6
  }

  // Net total (bold)
  doc.setFontSize(12)
  const netTotalText = `مبلغ کل سفارش: ${formatCurrency(data.netTotal)} ریال`
  doc.text(netTotalText, pageWidth - margin, yPos, { align: 'right' })
  yPos += 10

  // Amount in words
  doc.setFontSize(9)
  const amountInWords = numberToPersianWordsWithRial(data.netTotal)
  const amountText = `به حروف: ${amountInWords}`
  const amountLines = doc.splitTextToSize(amountText, maxWidth)
  for (let i = 0; i < amountLines.length; i++) {
    if (yPos > pageHeight - bottomMargin) {
      doc.addPage()
      yPos = 20
    }
    doc.text(amountLines[i], pageWidth - margin, yPos, { align: 'right' })
    yPos += 5
  }

  // === FOOTER ===
  yPos += 10
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  // const footerText = "این رسید توسط سیستم AllBox صادر شده است.";
  // doc.text(footerText, pageWidth / 2, yPos, { align: "center" });

  // Save the PDF
  const fileName = `receipt-order-${data.orderId}.pdf`
  doc.save(fileName)
}
