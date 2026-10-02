import Link from "next/link";

export default function Introuvable() {
  return (
    <section className="bandeau">
      <div className="bandeau-contenu">
        <h1>Cette page n&apos;existe pas</h1>
        <p>L&apos;adresse est peut-être mal écrite, ou la page a été retirée.</p>
        <div className="actions">
          <Link className="bouton" href="/">
            Revenir à l&apos;accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
