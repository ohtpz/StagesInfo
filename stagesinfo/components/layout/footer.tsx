export default function Footer() {
    return (
        <footer className="bg-white shadow-sm py-4 ">
            <div className="container mx-auto px-4">
                <p className="text-sm text-muted-foreground text-center">
                    &copy; {new Date().getFullYear()} StagesInfo. Tous droits réservés.
                </p>
            </div>
        </footer>
    );
}