import React, { useState } from 'react'
import { toast } from 'sonner'
import { usePage } from '@inertiajs/react'

const Contact = () => {
  const { props } = usePage()
  const csrfToken = (props as any)?.csrf_token || ''
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    message: '',
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
          toast.error('Please check the form for errors')
        } else {
          throw new Error(data.message || 'Failed to send message')
        }
      } else {
        toast.success(data.message)
        setFormData({
          email: '',
          first_name: '',
          last_name: '',
          message: '',
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send your message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="scroll-mt-24">
      <form onSubmit={handleSubmit} className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-100 to-green-100 border border-gray-300 rounded-lg">
        <div className='grid md:grid-cols-2 md:gap-5'>
            <div className="relative z-0 w-full mb-10 text-center">
                <h2 className="contact-header text-5xl font-bold mt-10">Contact Us</h2>
                <p className="mt-4 text-xl text-gray-500">
                    Need to get in touch with us? Fill out the form with your inquiry.
                </p>
            </div>

            <div className="relative z-0 w-full max-w-2xl mx-auto p-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="relative z-0 w-full mb-6 group">
                    <input
                        type="email"
                        name="email"
                        id="floating_email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`block py-3 px-2 w-full text-sm text-gray-900 dark:text-white bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer ${
                          errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder=" "
                        required
                    />
                    <label
                        htmlFor="floating_email"
                        className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:text-blue-600 dark:peer-focus:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                        Email
                    </label>
                    {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email}</span>}
                </div>

                <div className="grid md:grid-cols-2 md:gap-6">
                    <div className="relative z-0 w-full mb-5 group">
                        <input
                            type="text"
                            name="first_name"
                            id="floating_first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none dark:text-white focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                              errors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder=" "
                            required
                        />
                        <label htmlFor="floating_first_name" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">First name</label>
                        {errors.first_name && <span className="text-red-500 text-xs mt-1">{errors.first_name}</span>}
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                        <input
                            type="text"
                            name="last_name"
                            id="floating_last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none dark:text-white focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                              errors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder=" "
                            required
                        />
                        <label htmlFor="floating_last_name" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Last name</label>
                        {errors.last_name && <span className="text-red-500 text-xs mt-1">{errors.last_name}</span>}
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your message</label>
                    <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        className={`block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
                          errors.message ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Write your inquiry here..."
                        required
                    ></textarea>
                    {errors.message && <span className="text-red-500 text-xs mt-1">{errors.message}</span>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Sending...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            <span>Send Message</span>
                        </>
                    )}
                </button>
            </div>
        </div>
      </form>
    </section>
  )
}

export default Contact

