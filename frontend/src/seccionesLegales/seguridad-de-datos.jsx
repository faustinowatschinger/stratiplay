import React from 'react';

const SeguridadDeDatos = () => {
  return (
    <article className='flex flex-col items-center justify-center min-h-screen p-4'>
      <div className='bg-[#4D4D4D] text-white shadow-md rounded-lg p-6 max-w-4xl w-full'>
      <h1 className='text-3xl font-bold mb-4 text-center'>SEGURIDAD DE DATOS</h1>
      <ol>
        <li>Cifrado SSL/TLS: Protección en todas las comunicaciones.</li>
        <li>PCI DSS: Cumplimiento con el estándar para pagos.</li>
        <li>Tokenización: Uso de tokens para manejar datos de tarjetas.</li>
        <li>Acceso restringido: Solo personal autorizado puede acceder.</li>
        <li>Backups periódicos: Respaldos automáticos para prevenir pérdida de datos.</li>
      </ol>
      </div>
    </article>
  );
};

export default SeguridadDeDatos;