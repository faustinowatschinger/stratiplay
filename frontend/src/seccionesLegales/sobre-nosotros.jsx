import React from 'react';

const SobreNosotros = () => {
  return (
    <article className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-[#4D4D4D] text-white shadow-md rounded-lg p-6 max-w-4xl w-full">
        <h1 className="text-3xl font-bold mb-4 text-center">Sobre Nosotros</h1>
        <p className="text-lg mb-4">
          En Stratiplay, nos apasiona ayudar a las personas a mejorar sus habilidades en juegos estratégicos como el ajedrez y el póker. Nuestra plataforma ofrece planes de estudio personalizados que se adaptan a tu nivel y te guían paso a paso para que puedas alcanzar tus objetivos.
        </p>
        <p className="text-lg mb-4">
          Nuestro equipo está compuesto por expertos en juegos estratégicos y desarrolladores de software que trabajan juntos para crear una experiencia de aprendizaje única y efectiva. Creemos que con la orientación adecuada y las herramientas correctas, cualquiera puede mejorar sus habilidades y disfrutar más de los juegos estratégicos.
        </p>
        <p className="text-lg mb-4">
          Nos comprometemos a proporcionar contenido de alta calidad y a mantenernos actualizados con las últimas tendencias y estrategias en el mundo de los juegos estratégicos. Nuestro objetivo es ser tu recurso de referencia para el aprendizaje y la mejora continua en estos juegos.
        </p>
        <p className="text-lg mb-4">
          Gracias por elegir Stratiplay. Esperamos que disfrutes de nuestra plataforma y que te ayude a alcanzar tus metas en los juegos estratégicos.
        </p>
        <div className="flex justify-center mt-6">
          <img src="/imagenes/trabajo-en-equipo.webp" alt="Nuestro equipo" className="rounded-lg shadow-md w-full max-w-md" />
        </div>
      </div>
    </article>
  );
};

export default SobreNosotros;