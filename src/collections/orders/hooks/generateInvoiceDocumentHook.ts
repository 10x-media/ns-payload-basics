import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import axios, { type AxiosResponse } from 'axios'
import ejs from 'ejs'

import { Order } from '@/payload-types'

const invoiceTemplate = readFileSync(
  join(
    process.cwd(),
    'src',
    'collections',
    'orders',
    'hooks',
    'templates',
    'invoice-template.html',
  ),
  'utf-8',
)

export async function generateInvoiceDocumentHook({ data, req }: { data: Order; req: any }) {
  const payload = req.payload

  const html = ejs.render(invoiceTemplate, {
    order: {
      ...data,
      createdAtFormatted: data.createdAt
        ? new Date(data.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : '',
    },
  })

  let printData = {
    landscape: false,
    html: html,
    format: 'A4',
    tailwind: true,
  }

  console.log(html)

  // Send rendered HTML to Conversion Engine
  let response: AxiosResponse | undefined
  try {
    response = await axios({
      method: 'post',
      url: 'https://rapidapi.windypdf.com/convert',
      data: printData,
      headers: {
        'Content-Type': 'application/json',
        'api-secret': `${process.env.WINDYPDF_API_KEY}`,
      },
      responseType: 'stream',
    })
  } catch (e) {
    console.log(e)
  }

  if (!response) {
    throw new Error('Failed to generate invoice document')
  }

  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    response.data.on('data', (chunk: Buffer) => chunks.push(chunk))
    response.data.on('end', () => resolve(Buffer.concat(chunks)))
    response.data.on('error', (error: Error) => reject(error))
  })

  console.log(pdfBuffer)

  const invoice = await payload.create({
    collection: 'invoice-documents',
    file: {
      data: pdfBuffer, // Buffer containing file bytes
      // name: `invoice-${data.orderNumber}.pdf`, // e.g. 'invoice.pdf'
      name: 'invoice.pdf',
      type: 'application/pdf', // e.g. 'application/pdf'
      size: pdfBuffer.length,
    },
  })

  data.invoice = invoice.id

  return data
}
