import React from 'react';

const CumplimientoDeRegulaciones = () => {
  return (
    <article className='flex flex-col items-center justify-center min-h-screen p-4'>
      <div className="bg-[#4D4D4D] text-white shadow-md rounded-lg p-6 max-w-4xl w-full">
      <h1 className='text-3xl font-bold mb-4 text-center'>CUMPLIMIENTO DE REGULACIONES</h1>
      <h3 className='text-xl'>GDPR (Europa):</h3>
      <ol>
        <li>Derecho al olvido.</li>
        <li>Consentimiento explícito y registro de este.</li>
        <li>Portabilidad de datos.</li>
      </ol>
      <h3 className='text-xl'>CCPA (California):</h3>
      <ol>
        <li>Derecho a optar por no vender datos personales.</li>
        <li>Botón visible: "No vender mi información personal".</li>
      </ol>
      <h3 className='text-xl'>Ley 25.326 (Argentina):</h3>
      <ol>
        <li>Consentimiento informado.</li>
        <li>Seguridad en la protección de datos.</li>
      </ol>
      </div>
    </article>
  );
};

export default CumplimientoDeRegulaciones;