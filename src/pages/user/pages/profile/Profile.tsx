/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from '@tanstack/react-query'
import userApi from 'src/apis/user.api'
import Input from 'src/components/Input'
import Button from 'src/components/button'
import { UserSchema, userSchema } from 'src/utils/rules'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import InputNumber from 'src/components/inputNumber'
import { useContext, useEffect, useMemo, useState } from 'react'
import DateSelect from '../../component/DateSelect'
import { toast } from 'react-toastify'
import { AppContext } from 'src/context/app.context'
import { setProfileFromLS } from 'src/utils/auth'
import { getAvatarUrl, isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { ErrorResponse } from 'src/types/utils.type'
import InputFile from 'src/components/InputFile'

type FormData = Pick<UserSchema, 'name' | 'address' | 'phone' | 'date_of_birth' | 'avatar'>
type FormDataError = Omit<FormData, 'date_of_birth'> & {
  date_of_birth?: string
}
const profileSchema = userSchema.pick(['name', 'address', 'phone', 'date_of_birth', 'avatar'])
export default function Profile() {
  //sửa trên context luôn
  const { setProfile } = useContext(AppContext)
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
    setError
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      avatar: '',
      date_of_birth: new Date(1990, 0, 1)
    },
    resolver: yupResolver(profileSchema)
  })

  const { data: profileData, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: userApi.getProfile
  })
  const profile = profileData?.data.data
  // console.log(profile)
  useEffect(() => {
    if (profile) {
      setValue('name', profile.name)
      setValue('phone', profile.phone)
      setValue('avatar', profile.avatar)
      setValue('date_of_birth', profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(1990, 0, 1))
      setValue('address', profile.address)
    }
  }, [profile, setValue])
  const avatar = watch('avatar')
  const updateProfileMutation = useMutation(userApi.updateProfile)
  const uploadAvatarMutation = useMutation(userApi.uploadAvatar)
  const onSubmit = handleSubmit(async (data) => {
    try {
      let avatarName = avatar
      if (file) {
        const form = new FormData()
        form.append('image', file)
        const uploadResponse = await uploadAvatarMutation.mutateAsync(form)
        // console.log(uploadResponse)
        avatarName = uploadResponse.data.data
        setValue('avatar', avatarName)
      }
      const res = await updateProfileMutation.mutateAsync({
        ...data,
        date_of_birth: data.date_of_birth?.toISOString(),
        avatar: avatarName
      })
      setProfile(res.data.data)
      setProfileFromLS(res.data.data)
      refetch()
      toast.success(res.data.message)
    } catch (error) {
      if (isAxiosUnprocessableEntityError<ErrorResponse<FormDataError>>(error)) {
        const formError = error.response?.data.data
        if (formError) {
          Object.keys(formError).forEach((key) => {
            setError(key as keyof FormDataError, {
              message: formError[key as keyof FormDataError],
              type: 'Server'
            })
          })
        }
      }
    }
  })

  // upload ảnh
  // const fileInputRef = useRef<HTMLInputElement>(null)

  // const handleUpload = () => {
  //   fileInputRef.current?.click()
  // }
  const [file, setFile] = useState<File>()
  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : ''
  }, [file])
  // const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const fileFromLocal = e.target.files?.[0]
  //   if (fileFromLocal && (fileFromLocal.size >= config.maxSizeUploadAvatar || !fileFromLocal.type.includes('image'))) {
  //     toast.error('File ko đúng định dạng qui định')
  //   } else {
  //     setFile(fileFromLocal)
  //   }
  // }
  const handleChangeFile = (file?: File) => {
    setFile(file)
  }

  return (
    <div className='px-2 pb-10 bg-white rounded-sm shadow md:px-7 md:pb-20'>
      <div className='py-6 border-b border-b-gray-200'>
        <h1 className='text-lg font-medium text-gray-900'>Hồ sơ của tôi</h1>
        <div className='mt-1 text-sm text-gray-700'>Quản lí thông tin hồ sơ để bảo mật tài khoản</div>
      </div>
      <form onSubmit={onSubmit} className='flex flex-col-reverse mt-8 md:flex-row md:items-start '>
        <div className='flex-grow pr-3 mt-6 md:pr-12 md:mt-0'>
          <div className='flex flex-wrap'>
            <div className='w-[20%] truncate pt-3 text-right capitalize'>Email</div>
            <div className='w-[80%] pl-5'>
              <div className='pt-3 text-gray-700'>{profile?.email}</div>
            </div>
          </div>
          <div className='flex flex-wrap mt-6 sm:flex-row'>
            <div className='w-[20%] truncate pt-3 text-right capitalize'>Tên</div>
            <div className='w-[80%] pl-5'>
              <Input
                register={register}
                name='name'
                placeholder='Tên'
                errorMessage={errors.name?.message}
                classNameInput='w-full px-3 py-2 border border-gray-300 rounded-sm outline-none focus:border-gray-500'
              ></Input>
            </div>
          </div>
          <div className='flex flex-wrap mt-2 sm:flex-row'>
            <div className='w-[20%] truncate pt-3 text-right capitalize'>Số điện thoại</div>
            <div className='w-[80%] pl-5'>
              <Controller
                control={control}
                name='phone'
                render={({ field }) => (
                  <InputNumber
                    errorMessage={errors.phone?.message}
                    placeholder='Số điện thoại'
                    classNameInput='w-full px-3 py-2 border border-gray-300 rounded-sm outline-none focus:border-gray-500'
                    {...field}
                    onChange={field.onChange}
                  ></InputNumber>
                )}
              ></Controller>
            </div>
          </div>
          <div className='flex flex-wrap mt-2 sm:flex-row'>
            <div className='w-[20%] truncate pt-3 text-right capitalize'>Địa chỉ</div>
            <div className='w-[80%] pl-5'>
              <Input
                register={register}
                name='address'
                placeholder='Nhập địa chỉ'
                errorMessage={errors.address?.message}
                classNameInput='w-full px-3 py-2 border border-gray-300 rounded-sm outline-none focus:border-gray-500'
              ></Input>
            </div>
          </div>
          <Controller
            control={control}
            name='date_of_birth'
            render={({ field }) => {
              return (
                <DateSelect
                  value={field.value}
                  errorMessage={errors.date_of_birth?.message}
                  onChange={field.onChange}
                />
              )
            }}
          ></Controller>
          <div className='flex flex-wrap mt-2 sm:flex-row'>
            <div className='w-[20%] truncate pt-3 text-right capitalize'></div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Button
                type='submit'
                className='flex items-center px-5 text-sm text-center text-white rounded-sm h-9 bg-orange hover:bg-orange/80'
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>

        <div className='flex justify-center md:w-72 md:border-l md:border-l-gray-200'>
          <div className='flex flex-col items-center'>
            <div className='w-24 h-24 my-5'>
              <img
                src={previewImage || getAvatarUrl(avatar)}
                alt='avatar'
                className='object-cover w-full h-full rounded-full'
              />
            </div>

            <InputFile onChange={handleChangeFile}></InputFile>
            <div className='mt-3 text-gray-400'>
              <div>Dụng lượng file tối đa 1 MB </div>
              <div>Định dạng:.JPEG, .PNG</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

// import { yupResolver } from '@hookform/resolvers/yup'
// import { useMutation, useQuery } from '@tanstack/react-query'
// import { Fragment, useContext, useEffect, useMemo, useState } from 'react'
// import { useForm, Controller, FormProvider, useFormContext } from 'react-hook-form'
// import { toast } from 'react-toastify'
// import userApi from 'src/apis/user.api'
// import Button from 'src/components/Button'
// import Input from 'src/components/Input'
// import InputFile from 'src/components/InputFile'
// import InputNumber from 'src/components/InputNumber'
// import { AppContext } from 'src/contexts/app.context'
// import { ErrorResponse } from 'src/types/utils.type'
// import { setProfileFromLS } from 'src/utils/auth'
// import { userSchema, UserSchema } from 'src/utils/rules'
// import { getAvatarUrl, isAxiosUnprocessableEntityError } from 'src/utils/utils'
// import DateSelect from '../../components/DateSelect'

// function Info() {
//   const {
//     register,
//     control,
//     formState: { errors }
//   } = useFormContext<FormData>()
//   return (
//     <Fragment>
//       <div className='mt-6 flex flex-col flex-wrap sm:flex-row'>
//         <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Tên</div>
//         <div className='sm:w-[80%] sm:pl-5'>
//           <Input
//             classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
//             register={register}
//             name='name'
//             placeholder='Tên'
//             errorMessage={errors.name?.message}
//           />
//         </div>
//       </div>
//       <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
//         <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Số điện thoại</div>
//         <div className='sm:w-[80%] sm:pl-5'>
//           <Controller
//             control={control}
//             name='phone'
//             render={({ field }) => (
//               <InputNumber
//                 classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
//                 placeholder='Số điện thoại'
//                 errorMessage={errors.phone?.message}
//                 {...field}
//                 onChange={field.onChange}
//               />
//             )}
//           />
//         </div>
//       </div>
//     </Fragment>
//   )
// }

// type FormData = Pick<UserSchema, 'name' | 'address' | 'phone' | 'date_of_birth' | 'avatar'>
// type FormDataError = Omit<FormData, 'date_of_birth'> & {
//   date_of_birth?: string
// }
// const profileSchema = userSchema.pick(['name', 'address', 'phone', 'date_of_birth', 'avatar'])

// // Flow 1:
// // Nhấn upload: upload lên server luôn => server trả về url ảnh
// // Nhấn submit thì gửi url ảnh cộng với data lên server

// // Flow 2:
// // Nhấn upload: không upload lên server
// // Nhấn submit thì tiến hành upload lên server, nếu upload thành công thì tiến hành gọi api updateProfile

// export default function Profile() {
//   const { setProfile } = useContext(AppContext)
//   const [file, setFile] = useState<File>()

//   const previewImage = useMemo(() => {
//     return file ? URL.createObjectURL(file) : ''
//   }, [file])

//   const { data: profileData, refetch } = useQuery({
//     queryKey: ['profile'],
//     queryFn: userApi.getProfile
//   })
//   const profile = profileData?.data.data
//   const updateProfileMutation = useMutation(userApi.updateProfile)
//   const uploadAvatarMutaion = useMutation(userApi.uploadAvatar)
//   const methods = useForm<FormData>({
//     defaultValues: {
//       name: '',
//       phone: '',
//       address: '',
//       avatar: '',
//       date_of_birth: new Date(1990, 0, 1)
//     },
//     resolver: yupResolver(profileSchema)
//   })
//   const {
//     register,
//     control,
//     formState: { errors },
//     handleSubmit,
//     setValue,
//     watch,
//     setError
//   } = methods

//   const avatar = watch('avatar')

//   useEffect(() => {
//     if (profile) {
//       setValue('name', profile.name)
//       setValue('phone', profile.phone)
//       setValue('address', profile.address)
//       setValue('avatar', profile.avatar)
//       setValue('date_of_birth', profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(1990, 0, 1))
//     }
//   }, [profile, setValue])

//   const onSubmit = handleSubmit(async (data) => {
//     try {
//       let avatarName = avatar
//       if (file) {
//         const form = new FormData()
//         form.append('image', file)
//         const uploadRes = await uploadAvatarMutaion.mutateAsync(form)
//         avatarName = uploadRes.data.data
//         setValue('avatar', avatarName)
//       }
//       const res = await updateProfileMutation.mutateAsync({
//         ...data,
//         date_of_birth: data.date_of_birth?.toISOString(),
//         avatar: avatarName
//       })
//       setProfile(res.data.data)
//       setProfileToLS(res.data.data)
//       refetch()
//       toast.success(res.data.message)
//     } catch (error) {
//       if (isAxiosUnprocessableEntityError<ErrorResponse<FormDataError>>(error)) {
//         const formError = error.response?.data.data
//         if (formError) {
//           Object.keys(formError).forEach((key) => {
//             setError(key as keyof FormDataError, {
//               message: formError[key as keyof FormDataError],
//               type: 'Server'
//             })
//           })
//         }
//       }
//     }
//   })

//   const handleChangeFile = (file?: File) => {
//     setFile(file)
//   }

//   return (
//     <div className='rounded-sm bg-white px-2 pb-10 shadow md:px-7 md:pb-20'>
//       <div className='border-b border-b-gray-200 py-6'>
//         <h1 className='text-lg font-medium capitalize text-gray-900'>Hồ Sơ Của Tôi</h1>
//         <div className='mt-1 text-sm text-gray-700'>Quản lý thông tin hồ sơ để bảo mật tài khoản</div>
//       </div>
//       <FormProvider {...methods}>
//         <form className='mt-8 flex flex-col-reverse md:flex-row md:items-start' onSubmit={onSubmit}>
//           <div className='mt-6 flex-grow md:mt-0 md:pr-12'>
//             <div className='flex flex-col flex-wrap sm:flex-row'>
//               <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Email</div>
//               <div className='sm:w-[80%] sm:pl-5'>
//                 <div className='pt-3 text-gray-700'>{profile?.email}</div>
//               </div>
//             </div>
//             <Info />
//             <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
//               <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Địa chỉ</div>
//               <div className='sm:w-[80%] sm:pl-5'>
//                 <Input
//                   classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
//                   register={register}
//                   name='address'
//                   placeholder='Địa chỉ'
//                   errorMessage={errors.address?.message}
//                 />
//               </div>
//             </div>
//             <Controller
//               control={control}
//               name='date_of_birth'
//               render={({ field }) => (
//                 <DateSelect
//                   errorMessage={errors.date_of_birth?.message}
//                   value={field.value}
//                   onChange={field.onChange}
//                 />
//               )}
//             />
//             <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
//               <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right' />
//               <div className='sm:w-[80%] sm:pl-5'>
//                 <Button
//                   className='flex h-9 items-center rounded-sm bg-orange px-5 text-center text-sm text-white hover:bg-orange/80'
//                   type='submit'
//                 >
//                   Lưu
//                 </Button>
//               </div>
//             </div>
//           </div>
//           <div className='flex justify-center md:w-72 md:border-l md:border-l-gray-200'>
//             <div className='flex flex-col items-center'>
//               <div className='my-5 h-24 w-24'>
//                 <img
//                   src={previewImage || getAvatarUrl(avatar)}
//                   alt=''
//                   className='h-full w-full rounded-full object-cover'
//                 />
//               </div>
//               <InputFile onChange={handleChangeFile} />
//               <div className='mt-3 text-gray-400'>
//                 <div>Dụng lượng file tối đa 1 MB</div>
//                 <div>Định dạng:.JPEG, .PNG</div>
//               </div>
//             </div>
//           </div>
//         </form>
//       </FormProvider>
//     </div>
//   )
// }