import { formatPrice } from '@/lib/utils'
import { Order } from '@/payload-types'

export async function sendOrderConfirmationEmailHook({ doc, req }: { doc: Order; req: any }) {
  const payload = req.payload

  let invoice = null
  try {
    invoice = await payload.findByID({
      collection: 'invoice-documents',
      id: doc.invoice?.id || doc.invoice,
      depth: 0,
    })
  } catch (error) {
    console.error(error)
  }

  console.log(invoice)

  const currency = doc.lineItems?.[0]?.productSnapshot?.currency || 'USD'
  const total = formatPrice(doc.total, currency)

  try {
    await payload.sendEmail({
      //   from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
      to: doc.customer.email,
      subject: `Order Confirmation - ${doc.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6; color: #333;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #1a1a1a; padding: 30px 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Order Confirmation</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                        Hi ${doc.customer.name || 'there'},
                      </p>
                      <p style="margin: 0 0 30px 0; font-size: 16px; color: #666;">
                        Thank you for your order! We've received your payment and your order is being processed.
                      </p>
                      
                      <!-- Order Number -->
                      <div style="background-color: #f8f9fa; border-left: 4px solid #1a1a1a; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</p>
                        <p style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">${doc.orderNumber}</p>
                      </div>
                      
                      <!-- Order Items -->
                      <div style="margin: 30px 0;">
                        <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">Order Details</h2>
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          ${
                            doc.lineItems
                              ?.map(
                                (item) => `
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                                <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1a1a1a;">
                                  ${item.productSnapshot?.name || 'Product'} × ${item.quantity}
                                </p>
                                <p style="margin: 4px 0 0 0; font-size: 14px; color: #666;">
                                  ${formatPrice(item.unitPrice, item.productSnapshot?.currency || currency)} each
                                </p>
                              </td>
                              <td align="right" style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">
                                  ${formatPrice(item.subtotal || item.unitPrice * item.quantity, item.productSnapshot?.currency || currency)}
                                </p>
                              </td>
                            </tr>
                          `,
                              )
                              .join('') || ''
                          }
                        </table>
                      </div>
                      
                      <!-- Total -->
                      <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e5e5;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td align="right" style="padding: 8px 0;">
                              <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                                Total: ${total}
                              </p>
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      <!-- Shipping Address -->
                      ${
                        doc.shippingAddress
                          ? `
                      <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 4px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">Shipping Address</h3>
                        <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.8;">
                          ${doc.customer.name || ''}<br>
                          ${doc.shippingAddress.line1 || ''}<br>
                          ${doc.shippingAddress.line2 ? `${doc.shippingAddress.line2}<br>` : ''}
                          ${doc.shippingAddress.city || ''}, ${doc.shippingAddress.region || ''} ${doc.shippingAddress.postalCode || ''}<br>
                          ${doc.shippingAddress.country || ''}
                        </p>
                      </div>
                      `
                          : ''
                      }
                      
                      <!-- Footer Message -->
                      <p style="margin: 30px 0 0 0; font-size: 14px; color: #666;">
                        We'll send you another email when your order ships. If you have any questions, please don't hesitate to contact us.
                      </p>
                      ${(doc as any).invoice ? '<p style="margin: 20px 0 0 0; font-size: 14px; color: #666;">Please find the invoice attached to this email.</p>' : ''}
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e5e5;">
                      <p style="margin: 0; font-size: 12px; color: #999;">
                        This is an automated email. Please do not reply to this message.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      attachments: invoice?.url
        ? [
            {
              filename: invoice.filename,
              path: invoice.url,
            },
          ]
        : [],
    })
  } catch (error) {
    console.error(error)
  }
}
