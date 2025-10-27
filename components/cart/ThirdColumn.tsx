'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import SelectProductAmount from '../single-product/SelectProductAmount'
import { Mode } from '../single-product/SelectProductAmount'
import FormContainer from '../form/FormContainer'
import { SubmitButton } from '../form/Buttons'
import { removeCartItemAction, updateCartItemAction } from '@/utils/actions'

function ThirdColumn({ quantity, id }: { quantity: number; id: string }) {
  const [amount, setAmount] = useState(quantity)
  const [isLoading, setIsLoading] = useState(false)

  const handleAmountChange = async (value: number) => {
    setIsLoading(true)

    toast.promise(updateCartItemAction({ amount: value, cartItemId: id }), {
      loading: 'Calculating...',
      success: (result) => {
        setAmount(value)
        setIsLoading(false)
        return result.message
      },
      error: 'Failed to update'
    })
  }
  return (
    <div className="md:ml-8">
      <SelectProductAmount
        amount={amount}
        setAmount={handleAmountChange}
        mode={Mode.CartItem}
        isLoading={isLoading}
      />
      <FormContainer action={removeCartItemAction}>
        <input type="hidden" name="id" value={id} />
        <SubmitButton size="sm" className="mt-4" text="remove" />
      </FormContainer>
    </div>
  )
}

export default ThirdColumn
