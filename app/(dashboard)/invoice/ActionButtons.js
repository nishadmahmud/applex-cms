'use client'

import React from 'react'
import Invoice from './Invoice'
import { Button } from '@/components/ui/button'
import { Download, Printer } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import PdfInvoice from './PdfInvoice'

export default function ActionButtons() {
    return (
        <div className="flex flex-wrap gap-4 mt-6 justify-center">
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Printer className="w-4 h-4" />
                <span>Print Token</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Printer className="w-4 h-4" />
                <span>Print</span>
            </Button>
        </div>
    )
}
