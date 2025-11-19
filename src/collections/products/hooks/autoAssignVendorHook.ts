export function autoAssignVendorHook({
  req,
  data,
  operation,
}: {
  req: any
  data: any
  operation: 'create' | 'update'
}) {
  // Automatically set vendor when a vendor creates a product
  if (operation === 'create' && req.user && req.user.collection === 'vendors') {
    return {
      ...data,
      vendor: req.user.id,
    }
  }
  return data
}
