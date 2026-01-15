import Link from "next/link";

export function Navbar() {
  return (
    <header>
      <nav>
        <Link href="/" className="italic">
          <p className="text-3xl font-bold">StagesInfo</p>
        </Link>
        <ul>
          <Link href="/" className="nav-link">
            Offres
          </Link>
          <Link href="/connexion" className="nav-link text-blue">
            Connexion
          </Link>
        </ul>
      </nav>
    </header>
  );
}
