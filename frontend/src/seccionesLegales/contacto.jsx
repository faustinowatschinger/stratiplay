import React, { useState } from 'react';

const Contacto = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validate = () => {
    let errors = {};
    if (!formData.name) {
      errors.name = 'El nombre es obligatorio';
    }
    if (!formData.email) {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El correo electrónico no es válido';
    }
    if (!formData.message) {
      errors.message = 'El mensaje es obligatorio';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        const response = await fetch('https://formspree.io/f/xdkkvlzg', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          setFormData({
            name: '',
            email: '',
            message: ''
          });
        } else {
          setSubmitMessage('Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.');
        }
      } catch (error) {
        setSubmitMessage('Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setFormErrors(errors);
    }
  };

  if (isSubmitting) {
    return <div className="w-20 h-20 border-4 border-white m-auto border-t-black rounded-full animate-spin"></div>;
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <form className="flex flex-col w-max m-auto items-center justify-center text-white bg-[#4D4D4D] p-3 rounded-lg space-y-5 text-xl" onSubmit={handleSubmit}>
        <h2 className='text-3xl font-bold mb-4 text-center'>Contacto</h2>
        <div className='flex flex-col items-center justify-center w-full'>
          <label htmlFor="name">Nombre</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {formErrors.name && <span className="error">{formErrors.name}</span>}
        </div>
        <div className='flex flex-col items-center justify-center w-full'>
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {formErrors.email && <span className="error">{formErrors.email}</span>}
        </div>
        <div className='flex flex-col items-center justify-center w-full'>
          <label htmlFor="message">Mensaje</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
          ></textarea>
          {formErrors.message && <span className="error">{formErrors.message}</span>}
        </div>
        <button className="mt-4 text-base md:text-lg bg-[#252525] text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#1a1a1a] transition duration-300" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      {submitMessage && <p className="submit-message">{submitMessage}</p>}
    </div>
  );
};

export default Contacto;