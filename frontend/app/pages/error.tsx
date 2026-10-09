"use client";

export default function PageError({ reset }: { reset: () => void }) {
  return <section className="p-6" role="alert">
    <h1 className="text-lg font-semibold">Não foi possível exibir este conteúdo.</h1>
    <p className="my-3">Ocorreu um erro inesperado. A navegação continua disponível.</p>
    <button className="underline" type="button" onClick={reset}>Tentar novamente</button>
  </section>;
}
