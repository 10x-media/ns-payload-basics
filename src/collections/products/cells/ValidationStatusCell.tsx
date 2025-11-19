'use client'

import React from 'react'

export const ValidationStatusCell: React.FC<any> = ({ cellData }) => {
  const status = cellData as string | undefined

  if (!status) {
    return <span>-</span>
  }

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'checked':
        return {
          label: 'Checked',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300',
        }
      case 'blocked':
        return {
          label: 'Blocked',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300',
        }
      case 'needs human validation':
        return {
          label: 'Needs Review',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300',
        }
      default:
        return {
          label: status,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300',
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {config.label}
    </span>
  )
}
