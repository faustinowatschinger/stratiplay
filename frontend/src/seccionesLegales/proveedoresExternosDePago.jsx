import React from 'react';

const ProveedoresExternosDePago = () => {
  return (
    <article className='flex flex-col items-center justify-center min-h-screen p-4'>
      <div className='bg-[#4D4D4D] text-white shadow-md rounded-lg p-6 max-w-4xl w-full'>
      <h1 className='text-3xl font-bold mb-4 text-center'>PROVEEDORES EXTERNOS DE PAGO</h1>
      <ol><li> <h3 className='text-xl'>PayPal</h3>
      <ol>
        <li>Cumplen con PCI DSS.</li>
        <li>Almacenan y protegen la información financiera.</li>
        <li>Procesan pagos sin almacenar directamente datos sensibles en nuestros servidores.</li>
      </ol>
        </li>
        </ol>
      </div>
    </article>
  );
};

export default ProveedoresExternosDePago;