import React from 'react';

const MecanismosParaDerechosDelUsuario = () => {
  return (
    <article className='flex flex-col items-center justify-center min-h-screen p-4'>
      <div className="bg-[#4D4D4D] text-white shadow-md rounded-lg p-6 max-w-4xl w-full">
      <h1 className='text-3xl font-bold mb-4 text-center'>MECANISMOS PARA DERECHOS DEL USUARIO</h1>
      <ol>
        <li>Descargar datos: Los usuarios pueden descargar su información desde la configuración de la cuenta.</li>
        <li>Eliminar datos: Los usuarios pueden solicitar la eliminación de sus datos enviando un correo a stratiplay@stratiplay.com.</li>
        <li>Actualización de datos: Los usuarios pueden modificar sus datos desde la configuración de la cuenta.</li>
      </ol>
      </div>
    </article>
  );
};

export default MecanismosParaDerechosDelUsuario;