'use client';
// components/ContactForm.js

import React, { useState } from "react";
import { useRouter } from 'next/navigation'; // ✅ Import for App Router

const page = () => {
  const router = useRouter(); // ✅ Initialize router

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    alert("Form submitted!");
  };

  return (
    <div className='h-screen w-full text-[#D9D9D9] relative'>
      <div className='h-full w-full flex'>
        {/* Left side form */}
        <div className='w-[50%] bg-[#1D1D1D] h-full flex items-center justify-center'>
          <div>
            <h1 className='font-title leading-4 font-extrabold text-[8vw]'>GET IN</h1>
            <h1 className='font-title2 pl-[15vw] text-[8vw]'>Touch</h1>
            <form
              onSubmit={handleSubmit}
              className="max-w-lg mx-auto p-6 rounded shadow"
            >
              <div className="flex space-x-5 mb-10">
                <div className="flex-1">
                  <input
                    className="w-full border placeholder:text-[#D9D9D9] border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex-1">
                  <input
                    className="w-full border placeholder:text-[#D9D9D9] border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="email"
                    id="email"
                    placeholder="Your Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="mb-10">
                <textarea
                  className="w-[30vw] placeholder:text-[#D9D9D9] border border-gray-300 rounded px-3 py-2 h-44 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="message"
                  name="message"
                  placeholder="What can I help you with?"
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-[12vw] uppercase font-title text-white border border-[#D9D9D9] py-4 rounded-full hover:bg-white hover:text-black transition"
              >
                Submit message
              </button>
            </form>
          </div>
        </div>

        {/* Right side image */}
        <div className='w-[50%] bg-[#D9D9D9] relative'>
          <img src="contactbg.png" className='h-full w-full object-cover' alt="Contact Background" />

          {/* Cancel Icon */}
          <div
            className="absolute top-10 right-10 p-4 cursor-pointer"
            onClick={() => router.back()} // 👈 go back on click
          >
            <img src="cancleicon.png" alt="Cancel" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
