import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container-base text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-display text-5xl text-espresso-800 sm:text-6xl">
          That page brewed away.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-espresso-600">
          The page you are looking for does not exist, but Komal has a fresh
          cup waiting for you.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-primary">
            Back home
          </Link>
          <Link href="/order" className="btn-gold">
            Order a coffee
          </Link>
        </div>
      </div>
    </section>
  );
}
