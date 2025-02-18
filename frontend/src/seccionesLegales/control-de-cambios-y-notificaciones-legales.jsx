import React from 'react';

const ControlDeCambiosYNotificacionesLegales = () => {
  return (
    <article className='flex flex-col items-center justify-center min-h-screen p-4'>
      <div className="bg-[#4D4D4D] text-white shadow-md rounded-lg p-6 max-w-4xl w-full">
      <h1 className='text-3xl font-bold mb-4 text-center'>CONTROL DE CAMBIOS Y NOTIFICACIONES LEGALES</h1>
      <ol>
        <li>Historial de cambios: Se publicarán todas las actualizaciones de estas políticas junto con la fecha de vigencia.</li>
        <li>Notificaciones automáticas: Los usuarios serán informados por correo electrónico o notificación dentro de la plataforma sobre cualquier cambio significativo.</li>
      </ol>
      </div>
    </article>
  );
};

export default ControlDeCambiosYNotificacionesLegales;