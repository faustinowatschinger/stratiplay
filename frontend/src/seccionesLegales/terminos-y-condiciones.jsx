import React from 'react';

const TerminosYCondiciones = () => {
  return (
    <article className='flex flex-col items-center justify-center min-h-screen p-4'>
      <div className='bg-[#4D4D4D] text-white shadow-md rounded-lg p-6 max-w-4xl w-full'>
      <h1 className='text-3xl font-bold mb-4 text-center'>TÉRMINOS Y CONDICIONES</h1>
      <p>Última actualización: [Fecha]</p>
      <ol>
        <li>
          <h3 className='text-xl'>
          Descripción del servicio
          </h3>
          <ol>
            <li>Nuestra plataforma ofrece planes personalizados para estudiar juegos estratégicos como ajedrez y póker.</li>
          </ol>
        </li>
        <li>
          <h3 className='text-xl'>Requisitos del usuario</h3>
          <ol>
            <li>Debe ser mayor de 18 años o contar con el consentimiento de un tutor legal.</li>
            <li>Proveer información precisa y actualizada.</li>
          </ol>
        </li>
        <li>
          <h3 className='text-xl'>Planes y precios</h3>
          <ol>
            <li>Plan gratuito: $0/mes.</li>
            <li>Plan básico: $2,99/mes.</li>
            <li>Plan pro: $4,99/mes.</li>
          </ol>
        </li>
        <li>
          <h3 className='text-xl'>Pagos y facturación</h3>
          <ol>
            <li>Pagos procesados a través de PayPal.</li>
            <li>Política de reembolsos: Solo dentro de los primeros 7 días después de la compra.</li>
          </ol>
        </li>
        <li>
          <h3 className='text-xl'>Propiedad intelectual</h3>
          <p>Todo el contenido generado en la plataforma está protegido por derechos de autor.</p>
        </li>
        <li>
          <h3 className='text-xl'>Limitaciones de responsabilidad</h3>
          <ol>
            <li>No garantizamos disponibilidad ininterrumpida del servicio y no somos responsables de pérdidas derivadas de fallos técnicos.</li>
          </ol>
        </li>
        <li>
          <h3 className='text-xl'>Prohibiciones de uso</h3>
          <ol>
            <li>No se permite el uso del servicio para actividades ilegales o fraudulentas.</li>
          </ol>
        </li>
        <li>
          <h3 className='text-xl'>Resolución de disputas</h3>
          <ol>
            <li>Cualquier disputa será resuelta bajo las leyes de Argentina.</li>
          </ol>
        </li>
      </ol>
      </div>
    </article>
  );
};

export default TerminosYCondiciones;