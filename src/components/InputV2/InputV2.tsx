import { InputHTMLAttributes, useState } from 'react'
import { FieldPath, FieldValues, UseControllerProps, useController } from 'react-hook-form'

export interface InputNumberProps extends InputHTMLAttributes<HTMLInputElement> {
  classNameInput?: string
  classNameError?: string
}
function InputV2<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: UseControllerProps<TFieldValues, TName> & InputNumberProps) {
  const {
    type,
    onChange,
    className,
    classNameInput = 'w-full p-3 border border-gray-300 rounded-sm outline-none focus:border-gray-500',
    classNameError = 'mt-1 text-red-600 min-h-[1.25rem] text-sm',
    value = '',
    ...rest
  } = props
  const { field, fieldState } = useController(props)
  const [localValue, setLocalValue] = useState<string>(field.value)
  // gõ số thì onchange mới hcyaj
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueFromInput = e.target.value
    const numberCondition = (type === 'number' && /^\d+$/.test(valueFromInput)) || valueFromInput === ''
    if (numberCondition || type !== 'number') {
      //cập nhật localVluesata
      setLocalValue(valueFromInput)
      //gọi field.onCHnge để caapsj nhật vào statereact hook form
      field.onChange(e)
      //thực thi onCHange từ bên ngoài truyền vào
      onChange && onChange(e)
    }
  }
  return (
    <div className={className}>
      <input className={classNameInput} {...field} {...rest} onChange={handleChange} value={value || localValue} />
      <div className={classNameError}>{fieldState.error?.message}</div>
    </div>
  )
}
export default InputV2

// type Gen<TFunc> = {
//   getname: TFunc
// }
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// function Hexa<TFunc extends () => string, TLastName extends ReturnType<TFunc>>(props: {
//   person: Gen<TFunc>
//   lastName: TLastName
// }) {
//   return null
// }
// const handleName: () => 'duoc' = () => 'duoc'
// function App() {
//   return <Hexa person={{ getname: handleName }} lastName='duoc'></Hexa>
// }
