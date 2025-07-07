import React from 'react'

const page = () => {
  return (
    <div className='h-screen w-full text-[#D9D9D9] relative'>
      <div className='h-full w-full flex'>
        <div className='w-[50%] bg-[#1D1D1D]  h-full flex items-center justify-center'>
           <div>
            <h1 className='font-title leading-4 font-extrabold text-[8vw]'>GET IN</h1>
            <h1 className='font-title2 pl-[15vw] text-[8vw]'>Touch</h1>
           </div>
        </div>
        <div className='w-[50%] bg-[#D9D9D9]'>
            <img src="contactbg.png" className='h-full w-full object-cover' alt="" />
        </div>
      </div>
    </div>
  )
}

export default page
