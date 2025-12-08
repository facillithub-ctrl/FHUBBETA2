export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text dark:text-white">Configurações</h1>
      <p className="text-text-muted dark:text-gray-400 mb-6">Gerencie as configurações da sua conta e preferências.</p>
      
      <div className="max-w-2xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Gerenciamento da Conta</h2>
        <p className="text-text-muted">
            Em breve, você poderá alterar sua senha, gerenciar as notificações por e-mail e personalizar outras preferências da plataforma aqui.
        </p>
      </div>
    </div>
  );
}