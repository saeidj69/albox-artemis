import { beforeEach, describe, expect, test, vi } from 'vitest'

import type { ReceiptData } from './delivery-receipt'
import { generateDeliveryReceipt } from './delivery-receipt'

const mockText = vi.fn()
const mockLine = vi.fn()
const mockSetFontSize = vi.fn()
const mockSetDrawColor = vi.fn()
const mockSetTextColor = vi.fn()
const mockAddFileToVFS = vi.fn()
const mockAddFont = vi.fn()
const mockSetFont = vi.fn()
const mockSave = vi.fn()
const mockAutoTable = vi.fn()
const mockSplitTextToSize = vi.fn().mockImplementation((text: string) => [text])

vi.mock('jspdf', () => {
  return {
    jsPDF: function MockJsPDF() {
      return {
        internal: {
          pageSize: {
            getWidth: () => 297,
            getHeight: () => 210,
          },
        },
        text: mockText,
        line: mockLine,
        setFontSize: mockSetFontSize,
        setDrawColor: mockSetDrawColor,
        setTextColor: mockSetTextColor,
        addFileToVFS: mockAddFileToVFS,
        addFont: mockAddFont,
        setFont: mockSetFont,
        save: mockSave,
        autoTable: mockAutoTable,
        splitTextToSize: mockSplitTextToSize,
        lastAutoTable: { finalY: 100 },
      }
    },
  }
})

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}))

const sampleReceiptData: ReceiptData = {
  orderId: 1001,
  createdAt: '2026-03-20T10:00:00Z',
  customerName: 'علی محمدی',
  mobileNumber: '09123456789',
  nationalCode: '0012345678',
  address: 'تهران، خیابان آزادی',
  postalCode: '1234567890',
  proofOfDeliveryCode: '9988',
  products: [
    {
      name: 'پفک چیپسی',
      unitInBox: 24,
      retailPrice: 10000,
      quantity: 2,
      discountAmount: 2000,
      netPrice: 8000,
      totalNetPrice: 16000,
      vat: 10,
    },
  ],
  totalProductsPrice: 20000,
  totalDiscountAmount: 4000,
  netDeliveryFee: 15000,
  netTotal: 31000,
}

describe('generateDeliveryReceipt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: async () => new ArrayBuffer(8),
    } as Response)
  })

  test('calls jsPDF methods and saves receipt PDF', async () => {
    await generateDeliveryReceipt(sampleReceiptData)

    expect(mockSave).toHaveBeenCalledWith('receipt-order-1001.pdf')
    expect(mockText).toHaveBeenCalled()
  })
})
