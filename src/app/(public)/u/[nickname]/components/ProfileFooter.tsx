export default function ProfileFooter() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-8 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Facillit Hub. Perfil público de estudante.
        </p>
        <div className="flex gap-4 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-royal-blue transition-colors">Denunciar Perfil</a>
            <a href="/" className="hover:text-royal-blue transition-colors">Sobre a Plataforma</a>
        </div>
      </div>
    </footer>
  );
}