import React from 'react';

const ConsentimientoExplicito = () => {
  return (
    <article className='flex flex-col items-center justify-center min-h-screen p-4'>
      <div className="bg-[#4D4D4D] text-white shadow-md rounded-lg p-6 max-w-4xl w-full">
      <h1 className='text-3xl font-bold mb-4 text-center'>CONSENTIMIENTO EXPLÍCITO</h1>
      <ol className='flex flex-col items-start justify-center gap-4'>
        <li>
          <h3 className='text-xl'>Antes de utilizar nuestros servicios, el usuario deberá</h3>
          <ol>
          <li>Marcar una casilla indicando su consentimiento para procesar datos.</li>
          <li>Aceptar términos separados para recibir correos de marketing.</li>
          </ol>
        </li>
      </ol>
      </div>
    </article>
  );
};

export default ConsentimientoExplicito;