import React from 'react'

const Form = () => {
  return (
    <div>
        <div className='border border-indigo-600 w-[50%] ml-10 mt-10 rounded-lg ' >
<form className='flex flex-col items-center justify-center gap-4 mt-10 mb-10'>
<label htmlFor="name">Enter your Name</label>
          <input
            id="name"
            className='border border-black'
            placeholder='Name'
            type="text"
          />

          <label htmlFor="phone">Enter your Phone</label>
          <input
            id="phone"
            className='border border-black'
            placeholder='Phone'
            type="tel"
          />

          <label htmlFor="email">Enter your Email</label>
          <input
            id="email"
            className='border border-black'
            placeholder='Email'
            type="email"
          />

          <label htmlFor="file">Upload a File</label>
          <input
            id="file"
            className='border border-black'
            type="file"
          />

</form>
</div>
    </div>
  )
}

export default Form