'use client';
// components/ContactForm.js

import React from "react";
import { useRouter } from 'next/navigation'; // ✅ App Router navigation

const ContactForm = () => {
  const router = useRouter(); // ✅ For cancel icon "go back"

  return (
    <div className='h-screen w-full text-[#D9D9D9] relative'>
      <div className='h-full w-full flex'>

        {/* Left side form */}
        <div className='w-[50%] bg-[#1D1D1D] h-full flex items-center justify-center'>
          <div>
            <h1 className='font-title leading-4 font-extrabold text-[8vw]'>GET IN</h1>
            <h1 className='font-title2 pl-[15vw] text-[8vw]'>Touch</h1>

            <form
              action="https://formsubmit.co/chougulesanket30@gmail.com" // ⬅️ Replace with your email
              method="POST"
              className="max-w-lg mx-auto p-6 rounded shadow"
            >
              {/* Optional Hidden Inputs */}
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_next" value="https://yourdomain.com/thank-you" />
              <input type="hidden" name="_subject" value="New Contact Form Submission" />

              <div className="flex space-x-5 mb-10">
                <div className="flex-1">
                  <input
                    className="w-full border placeholder:text-[#D9D9D9] border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div className="flex-1">
                  <input
                    className="w-full border placeholder:text-[#D9D9D9] border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    required
                  />
                </div>
              </div>

              <div className="mb-10">
                <textarea
                  className="w-[30vw] placeholder:text-[#D9D9D9] border border-gray-300 rounded px-3 py-2 h-44 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="message"
                  placeholder="What can I help you with?"
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
            onClick={() => router.back()} // 👈 Go back
          >
            <img src="cancleicon.png" alt="Cancel" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
